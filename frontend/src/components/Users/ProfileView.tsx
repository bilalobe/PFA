// frontend2/src/components/ProfileView.tsx

import { useState } from 'react';
import { User } from '../interfaces/User'; // import the User interface

interface ProfileViewProps {
  user: User;
  isEditing: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, isEditing }) => {
  const [userData, setUserData] = useState(user);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
          />
          {/* Add more fields as needed */}
        </div>
      ) : (
        <div>
          <p>{userData.name}</p>
          {/* Display more fields as needed */}
        </div>
      )}
    </div>
  );
};

export { ProfileView };