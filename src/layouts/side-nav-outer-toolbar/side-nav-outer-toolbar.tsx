'use client'
import Drawer from 'devextreme-react/drawer';
import { ScrollView, ScrollViewRef } from 'devextreme-react/scroll-view';
import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header, SideNavigationMenu } from '@/components';
import './side-nav-outer-toolbar.scss';
import { useScreenSize } from '@/utils/media-query';
import { Template } from 'devextreme-react/core/template';
import type { ButtonTypes } from 'devextreme-react/button';
import type { TreeViewTypes } from 'devextreme-react/tree-view';
import type { SideNavToolbarProps } from '@/types';
export default function SideNavOuterToolbar({ title, children }: React.PropsWithChildren<SideNavToolbarProps>) {
  const scrollViewRef = useRef<ScrollViewRef>(null);
const router = useRouter();
  const { isXSmall, isLarge } = useScreenSize();
  const [menuStatus, setMenuStatus] = useState(
    isLarge ? MenuStatus.Opened : MenuStatus.Closed
  );

  const toggleMenu = useCallback(({ event }: ButtonTypes.ClickEvent) => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.Opened
        : MenuStatus.Closed
    );
    event?.stopPropagation();
  }, []);

  const temporaryOpenMenu = useCallback(() => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.TemporaryOpened
        : prevMenuStatus
    );
  }, []);

  const onOutsideClick = useCallback(() => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus !== MenuStatus.Closed && !isLarge
        ? MenuStatus.Closed
        : prevMenuStatus
    );
    return menuStatus === MenuStatus.Closed ? true : false;
  }, [isLarge, menuStatus]);

  const onNavigationChanged = useCallback(({ itemData, event, node }: TreeViewTypes.ItemClickEvent) => {
    if (menuStatus === MenuStatus.Closed || !itemData?.path || node?.selected) {
      event?.preventDefault();
      return;
    }

router.push(itemData.path);
    scrollViewRef.current?.instance().scrollTo(0);

    if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
      setMenuStatus(MenuStatus.Closed);
      event?.stopPropagation();
    }
  }, [router, menuStatus, isLarge]);

  return (
    <div className={'side-nav-outer-toolbar'}>
      <Header
        menuToggleEnabled
        toggleMenu={toggleMenu}
        title={title}
      />
      <Drawer
        className={'drawer layout-body'}
        position={'before'}
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge ? 'shrink' : 'overlap'}
        revealMode={isXSmall ? 'slide' : 'expand'}
        minSize={isXSmall ? 0 : 60}
        maxSize={250}
        shading={isLarge ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template={'menu'}
      >
        <div className={'container'}>
          <ScrollView ref={scrollViewRef} className={'with-footer'}>
            <div className={'content'}>
              {React.Children.map(children, (item) => {
                if (React.isValidElement(item) && item.type !== "footer") {
                  return item;
                }
                return null;
              })}
            </div>
            <div className={'content-block'}>
              {React.Children.map(children, (item) => {
                if (React.isValidElement(item) && item.type === "footer") {
                  return item;
                }
                return null;
              })}
            </div>
          </ScrollView>
        </div>
        <Template name={'menu'}>
          <SideNavigationMenu
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={temporaryOpenMenu}
          >
          </SideNavigationMenu>
        </Template>
      </Drawer>
    </div>
  );
}

const MenuStatus = {
  Closed: 1,
  Opened: 2,
  TemporaryOpened: 3
};
