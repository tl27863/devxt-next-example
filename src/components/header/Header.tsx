import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import UserPanel from '@/components/user-panel/UserPanel';
import './Header.scss';
import { ThemeSwitcher } from '@/components/theme-switcher/ThemeSwitcher';
import type { HeaderProps } from '@/types';

const renderMenuItem = () => <UserPanel menuMode='list' />;

export default function Header({ menuToggleEnabled, title, toggleMenu }: HeaderProps) {
  return (
    <header className={'header-component'}>
      <Toolbar className={'header-toolbar'}>
        <Item
          visible={menuToggleEnabled}
          location={'before'}
          widget={'dxButton'}
          cssClass={'menu-button'}
        >
          <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
        </Item>
        <Item
          location={'before'}
          cssClass={'header-title'}
          text={title}
          visible={!!title}
        />
        <Item
          location={'after'}
        >
          <ThemeSwitcher />
        </Item>
        <Item location='after' locateInMenu='auto' menuItemRender={renderMenuItem}>
          <UserPanel menuMode='context' />
        </Item>
      </Toolbar>
    </header>
)}
