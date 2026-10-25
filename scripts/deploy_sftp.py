
"""Déploie le contenu de dist/ sur un hébergement SFTP."""

import base64
import hashlib
import hmac
import os
import pathlib
import posixpath
import stat

import paramiko


def get_env(name: str) -> str:
    value = os.environ.get(name, "")
    if not value.strip():
        raise RuntimeError(f"Variable d'environnement absente ou vide : {name}")
    return value.strip() if name != "SFTP_PASSWORD" else value


def deploy() -> None:
    host = get_env("SFTP_HOST")
    host_fingerprint = get_env("SFTP_HOST_FINGERPRINT")
    remote_dir = get_env("SFTP_TARGET")
    user = get_env("SFTP_USER")
    password = get_env("SFTP_PASSWORD")

    local_dir = pathlib.Path("dist")
    if not local_dir.is_dir() or local_dir.is_symlink():
        raise RuntimeError("Le dossier dist/ est absent ou invalide.")
    if not (local_dir / "index.html").is_file():
        raise RuntimeError("Le fichier dist/index.html est introuvable.")

    # Éviter un déploiement accidentel hors du dossier du site.
    if (
        remote_dir.startswith("/")
        or "\\" in remote_dir
        or any(part in (".", "..", "") for part in remote_dir.split("/"))
    ):
        raise RuntimeError(
            "SFTP_TARGET doit être un chemin relatif sûr (ex. : www)."
        )

    entries = sorted(local_dir.rglob("*"))
    if any(entry.is_symlink() for entry in entries):
        raise RuntimeError(
            "Le dossier dist/ contient un lien symbolique : envoi annulé."
        )

    print("Le dossier dist/ est prêt.")

    transport = paramiko.Transport((host, 22))

    try:
        # Le serveur OVHcloud a été identifié avec une clé Ed25519.
        transport.get_security_options().key_types = ("ssh-ed25519",)
        transport.start_client(timeout=20)

        server_key = transport.get_remote_server_key()
        digest = hashlib.sha256(server_key.asbytes()).digest()
        fingerprint = (
            "SHA256:"
            + base64.b64encode(digest).decode("ascii").rstrip("=")
        )

        if not hmac.compare_digest(fingerprint, host_fingerprint):
            raise RuntimeError(
                "L'empreinte SSH du serveur ne correspond pas."
            )

        print("Identité du serveur vérifiée.")

        # Jamais d'authentification avant la vérification SSH.
        transport.auth_password(user, password)

        if not transport.is_authenticated():
            raise RuntimeError("Authentification SSH incomplète.")

        print("Authentification SSH réussie.")

        sftp = paramiko.SFTPClient.from_transport(transport)
        if sftp is None:
            raise RuntimeError("Impossible d'ouvrir le canal SFTP.")

        try:
            remote_root = posixpath.join(
                sftp.normalize("."), remote_dir
            )

            # Le dossier www doit déjà exister chez OVHcloud.
            if not stat.S_ISDIR(sftp.stat(remote_root).st_mode):
                raise RuntimeError(
                    "SFTP_TARGET ne désigne pas un répertoire."
                )

            print(f"Répertoire de destination : {remote_root}")

            # Reproduire l'arborescence de dist/.
            directories = sorted(
                (entry for entry in entries if entry.is_dir()),
                key=lambda entry: (
                    len(entry.relative_to(local_dir).parts),
                    entry.as_posix(),
                ),
            )

            for directory in directories:
                relative = directory.relative_to(local_dir).as_posix()
                destination = posixpath.join(remote_root, relative)

                try:
                    sftp.mkdir(destination)
                except OSError:
                    if not stat.S_ISDIR(sftp.stat(destination).st_mode):
                        raise

            # Transférer les HTML en dernier, après les ressources.
            files = sorted(
                (entry for entry in entries if entry.is_file()),
                key=lambda entry: (
                    entry.suffix.lower() in (".html", ".htm"),
                    entry.as_posix(),
                ),
            )

            for index, file in enumerate(files, start=1):
                relative = file.relative_to(local_dir).as_posix()
                destination = posixpath.join(remote_root, relative)

                sftp.put(str(file), destination, confirm=True)

                print(f"[{index}/{len(files)}] {relative}")

            print(
                f"Déploiement terminé : {len(files)} fichier(s) transféré(s)."
            )

        finally:
            sftp.close()

    finally:
        transport.close()


if __name__ == "__main__":
    deploy()
