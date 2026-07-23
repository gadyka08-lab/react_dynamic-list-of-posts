import { User } from '../types/User';
import React, { useState } from 'react';
export interface Props {
  users: User[];
  // Стан може бути об'єктом користувача або null, якщо ніхто не обраний
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  handleSelectUser: (user: User) => void;
}

export const UserSelector: React.FC<Props> = ({
  users,
  selectedUser,
  //setSelectedUser,
  handleSelectUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      data-cy="UserSelector"
      className={`dropdown ${isOpen ? 'is-active' : ''}`}
    >
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          // перемикаємо стан isOpen на протилежний при кліку
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedUser ? selectedUser.name : 'Select user'}</span>
        </button>
      </div>

      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {users.map(user => (
            <a
              key={user.id}
              href={`#user-${user.id}`}
              className="dropdown-item"
              onClick={() => {
                handleSelectUser(user);
                // закриваємо меню після вибору юзера
                setIsOpen(false);
              }}
            >
              {user.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
