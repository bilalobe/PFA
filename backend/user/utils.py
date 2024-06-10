from PIL import Image

def resize_profile_picture(image_path, new_width=200, new_height=200):
    """
    Resizes a profile picture to the specified dimensions.
    """
    try:
        img = Image.open(image_path)

        # Check if the image needs resizing
        if img.width > new_width or img.height > new_height:
            img.thumbnail((new_width, new_height))
            img.save(image_path)

    except IOError as e:
        print(f"Error resizing profile picture: {e}")