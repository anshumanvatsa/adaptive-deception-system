from cryptography.fernet import Fernet
from config.config import FERNET_KEY


cipher = Fernet(FERNET_KEY)


def encrypt_data(value):
    if value is None:
        return None
    return cipher.encrypt(str(value).encode()).decode()


def decrypt_data(value):
    if value is None:
        return None
    return cipher.decrypt(value.encode()).decode()
