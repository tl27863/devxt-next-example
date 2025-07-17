import type { PropsWithChildren } from 'react';
import appInfo from '@/app-info';
import { Footer } from '@/components';
import { SideNavOuterToolbar as SideNavBarLayout } from '@/layouts';

export default function Content({children}: PropsWithChildren<object>) {
  return (
    <SideNavBarLayout title={appInfo.title}>
      {children}
      <Footer>
        Copyright © 2011-{new Date().getFullYear()} {appInfo.title} Inc.
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </Footer>
    </SideNavBarLayout>
  );
}
