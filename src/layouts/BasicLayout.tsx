/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React, {useEffect, useState} from 'react';
import {connect} from 'dva';
import Link from 'umi/link';
import {setLocale, formatMessage} from 'umi-plugin-react/locale';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import {ConnectState, Dispatch} from '@/models/connect';
import {isAntDesignPro} from '@/utils/utils';
import logo from '../assets/logo.png';
import style from './BasicLayout.scss';
import {Row} from "antd";

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  dispatch: Dispatch;
}

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>{
  if(window.navigator.userAgent.indexOf("Electron") !== -1){
    menuList = menuList.filter(one => {
      return one["name"] !== '登陆助手'
    })
  }
  return menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : [],
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  })
};


const footer = (
  <div className={style.footer}>
    <Row className={style.info}>
      <span className={style.name}>ArtiPub</span>
      <span className={style.slogan}>让你的文章随处可阅</span>
      <a className={style.github} href="https://github.com/crawlab-team/artipub" target="_blank">
        <img src="https://img.shields.io/github/stars/crawlab-team/artipub?logo=github"/>
      </a>
    </Row>
    <Row className={style.copyright}>
      Copyright (c) 2019, Crawlab Team All rights reserved.
    </Row>
  </div>
);

const footerRender: BasicLayoutProps['footerRender'] = (_, defaultDom) => {
  if(window.navigator.userAgent.indexOf("Electron") !== -1){
    return false
  }
  if (!isAntDesignPro()) {
    return footer;
  }
  return (
    <>
      {defaultDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  var curMenuList = [];
  const {dispatch, children, settings} = props;
  const [menuData, setMenuData] = useState([]);
  /**
   * constructor
   */
  useEffect(() => {
      setMenuData( menuDataRender(curMenuList) || []);
  }, []);
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
      dispatch({
        type: 'settings/getSetting',
      });
    }
  }, []);

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void =>
    dispatch &&
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload,
    });

  // set locale default as zh-CN
  setLocale('zh-CN');

  return (
    <ProLayout
      logo={logo}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => {
        if(window.navigator.userAgent.indexOf("Electron") !== -1) {
          return false
        }else {
          return [
            {
              path: '/',
              breadcrumbName: formatMessage({
                id: 'menu.home',
                defaultMessage: 'Home',
              }),
            },
            ...routers,
          ]
        }

      }}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      menuDataRender={(list)=>{
        curMenuList = list
        return menuData
      }}
      formatMessage={formatMessage}
      rightContentRender={rightProps => <RightContent {...rightProps} />}
      {...props}
      {...settings}
    >
      {children}
    </ProLayout>
  );
};

export default connect(({global, settings}: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
