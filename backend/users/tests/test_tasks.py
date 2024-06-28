import pytest
from unittest.mock import MagicMock, patch

from backend.users.tasks import resize_profile_picture


@pytest.fixture
def user_id():
    return "user_id"


@pytest.fixture
def image_field_name():
    return "profile_picture"


@pytest.fixture
def user_ref_mock():
    return MagicMock()


@pytest.fixture
def user_doc_mock():
    return MagicMock()


@pytest.fixture
def blob_mock():
    return MagicMock()


@pytest.fixture
def img_mock():
    return MagicMock()


@pytest.fixture
def buffer_mock():
    return MagicMock()


@pytest.fixture
def new_blob_mock():
    return MagicMock()


@pytest.fixture
def firestore_client_mock(user_ref_mock, user_doc_mock):
    firestore_client_mock = MagicMock()
    firestore_client_mock.collection.return_value.document.return_value = user_ref_mock
    user_ref_mock.get.return_value = user_doc_mock
    return firestore_client_mock


@pytest.fixture
def storage_bucket_mock(blob_mock, new_blob_mock):
    storage_bucket_mock = MagicMock()
    storage_bucket_mock.blob.side_effect = [blob_mock, new_blob_mock]
    return storage_bucket_mock


@pytest.fixture
def image_open_mock(img_mock):
    with patch("backend.users.tasks.Image.open", return_value=img_mock) as mock:
        yield mock


@pytest.fixture
def image_save_mock(buffer_mock):
    with patch("backend.users.tasks.Image.save") as mock:
        mock.return_value = buffer_mock
        yield mock


@pytest.fixture
def blob_download_as_bytes_mock():
    with patch("backend.users.tasks.blob.download_as_bytes") as mock:
        yield mock


@pytest.fixture
def blob_reload_mock():
    with patch("backend.users.tasks.blob.reload") as mock:
        yield mock


@pytest.fixture
def blob_size():
    return 5242881


@pytest.fixture
def logging_warning_mock():
    with patch("backend.users.tasks.logging.warning") as mock:
        yield mock


@pytest.fixture
def logging_info_mock():
    with patch("backend.users.tasks.logging.info") as mock:
        yield mock


@pytest.fixture
def logging_error_mock():
    with patch("backend.users.tasks.logging.error") as mock:
        yield mock


def test_resize_profile_picture_success(
    user_id,
    image_field_name,
    user_ref_mock,
    user_doc_mock,
    blob_mock,
    img_mock,
    buffer_mock,
    new_blob_mock,
    firestore_client_mock,
    storage_bucket_mock,
    image_open_mock,
    image_save_mock,
    blob_download_as_bytes_mock,
    blob_reload_mock,
    logging_info_mock,
):
    # Mock Firestore document data
    user_data = {image_field_name: "image_path"}
    user_doc_mock.to_dict.return_value = user_data

    # Mock blob size
    blob_mock.size = 5242880

    # Mock image dimensions
    img_mock.width = 300
    img_mock.height = 300

    # Call the function
    resize_profile_picture(user_id, image_field_name)

    # Assertions
    firestore_client_mock.collection.assert_called_once_with("users")
    firestore_client_mock.collection.return_value.document.assert_called_once_with(user_id)
    user_ref_mock.get.assert_called_once()
    user_doc_mock.to_dict.assert_called_once()
    user_ref_mock.update.assert_called_once_with({image_field_name: "resized_images/user_id/profile_picture"})
    blob_mock.download_as_bytes.assert_called_once()
    image_open_mock.assert_called_once_with(blob_download_as_bytes_mock.return_value)
    img_mock.thumbnail.assert_called_once_with((200, 200))
    image_save_mock.assert_called_once_with(buffer_mock, format=img_mock.format)
    new_blob_mock.upload_from_string.assert_called_once_with(
        buffer_mock.getvalue(), content_type=f"image/{img_mock.format.lower()}"
    )
    logging_info_mock.assert_called_once_with(f"User {user_id} does not have a profile picture.")


def test_resize_profile_picture_no_user_data(
    user_id,
    image_field_name,
    user_ref_mock,
    user_doc_mock,
    logging_error_mock,
    firestore_client_mock,
    logging_info_mock,
):
    # Mock Firestore document data
    user_doc_mock.to_dict.return_value = None

    # Call the function
    resize_profile_picture(user_id, image_field_name)

    # Assertions
    firestore_client_mock.collection.assert_called_once_with("users")
    firestore_client_mock.collection.return_value.document.assert_called_once_with(user_id)
    user_ref_mock.get.assert_called_once()
    user_doc_mock.to_dict.assert_called_once()
    logging_info_mock.assert_called_once_with(f"User {user_id} does not have a profile picture.")
    logging_error_mock.assert_called_once_with(f"User document with ID {user_id} does not have any data.")


def test_resize_profile_picture_no_user_document(
    user_id,
    image_field_name,
    user_ref_mock,
    logging_error_mock,
    firestore_client_mock,
    ):
    # Mock Firestore document existence
    user_ref_mock.get.return_value.exists = False

    # Call the function
    resize_profile_picture(user_id, image_field_name)

    # Assertions
    firestore_client_mock.collection.assert_called_once_with("users")
    firestore_client_mock.collection.return_value.document.assert_called_once_with(user_id)
    user_ref_mock.get.assert_called_once()
    logging_error_mock.assert_called_once_with(f"User document with ID {user_id} does not exist.")


def test_resize_profile_picture_large_file_size(
    user_id,
    image_field_name,
    user_ref_mock,
    user_doc_mock,
    blob_mock,
    blob_reload_mock,
    logging_warning_mock,
    firestore_client_mock,
    storage_bucket_mock,
    image_open_mock,
    blob_size,
):
    # Mock Firestore document data
    user_data = {image_field_name: "image_path"}
    user_doc_mock.to_dict.return_value = user_data

    # Mock blob size
    blob_mock.size = blob_size

    # Call the function
    resize_profile_picture(user_id, image_field_name)

    # Assertions
    firestore_client_mock.collection.assert_called_once_with("users")
    firestore_client_mock.collection.return_value.document.assert_called_once_with(user_id)
    user_ref_mock.get.assert_called_once()
    user_doc_mock.to_dict.assert_called_once()
    blob_reload_mock.assert_called_once()
    logging_warning_mock.assert_called_once_with(f"Image file size is too large to process: {blob_size} bytes.")