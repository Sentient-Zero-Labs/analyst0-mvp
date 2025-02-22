from nanoid import generate


def generate_uuid(size: int = 30) -> str:
    """
    Generate a UUID using nanoid with a default size of 30 characters.

    Args:
        size (int): The length of the UUID to generate. Defaults to 30.

    Returns:
        str: A unique identifier string.
    """
    return generate(size=size)
