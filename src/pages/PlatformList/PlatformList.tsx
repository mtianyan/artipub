import React, { useEffect, useReducer, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { Platform, PlatformModelState, SiteArticle } from '@/models/platform';
import { ConnectProps, ConnectState, Dispatch } from '@/models/connect';
import { connect } from 'dva';
import { ColumnProps, SelectionSelectFn, TableRowSelection } from 'antd/lib/table';
import constants from '@/constants';

// logo images
import imgJuejin from '@/assets/img/juejin-logo.svg';
import imgSegmentfault from '@/assets/img/segmentfault-logo.jpg';
import imgJianshu from '@/assets/img/jianshu-logo.png';
import imgCsdn from '@/assets/img/csdn-logo.jpg';
import imgZhihu from '@/assets/img/zhihu-logo.jpg';
import imgOschina from '@/assets/img/oschina-logo.jpg';
import imgToutiao from '@/assets/img/toutiao-logo.png';
import imgCnblogs from '@/assets/img/cnblogs-logo.gif';
import imgV2ex from '@/assets/img/v2ex-logo.jpg';
import imgWechat from '@/assets/img/wechat-logo.jpg';
import style from './PlatformList.scss';
import JuejinSetting from '../Settings/JueJinSetting'
import SegmentfaultSetting from "../Settings/SegmentfaultSetting";
import ZhihuSetting from "../Settings/ZhihuSetting";
import OschinaSetting from "../Settings/OschinaSetting";

export interface PlatformListProps extends ConnectProps {
  platform: PlatformModelState;
  dispatch: Dispatch;
}

declare global {
  interface Window {
    require: any;
  }
}


const PlatformList: React.FC<PlatformListProps> = props => {
  const { dispatch, platform } = props;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [curPlatform, setCurPlatform] = useState(null);
  // const onEdit: Function = (d: Platform) => {
  //   return () => {
  //     dispatch({
  //       type: 'platform/saveCurrentPlatform',
  //       payload: d,
  //     });
  //     dispatch({
  //       type: 'platform/saveModalVisible',
  //       payload: true,
  //     });
  //   };
  // };
  //
  // const onAdd = () => {
  //   dispatch({
  //     type: 'platform/saveCurrentPlatform',
  //     payload: {
  //       name: '',
  //       label: '',
  //       description: '',
  //     }
  //   });
  //   dispatch({
  //     type: 'platform/saveModalVisible',
  //     payload: true,
  //   });
  // };
  //
  // const onDelete: Function = (d: Platform) => {
  //   return async () => {
  //     if (dispatch) {
  //       await dispatch({
  //         type: 'platform/deletePlatform',
  //         payload: d
  //       });
  //       await dispatch({
  //         type: 'platform/fetchPlatformList',
  //       });
  //     }
  //   };
  // };

  const onFieldChange: Function = (type: string, fieldName: string) => (ev: any) => {
    const { currentPlatform } = platform;
    if (currentPlatform) {
      if (type === constants.inputType.INPUT) {
        currentPlatform[fieldName] = ev.target.value;
      } else if (type === constants.inputType.SELECT) {
        currentPlatform[fieldName] = ev;
      }
      dispatch({
        type: 'platform/saveCurrentPlatform',
        payload: currentPlatform,
      });
    }
  };

  const onModalCancel = () => {
    dispatch({
      type: 'platform/saveModalVisible',
      payload: false,
    });
  };

  const onSave = async () => {
    if (platform.currentPlatform) {
      if (platform.currentPlatform._id) {
        // 更改
        await dispatch({
          type: 'platform/savePlatform',
          payload: platform.currentPlatform,
        });
      } else {
        // 新增
        await dispatch({
          type: 'platform/addPlatform',
          payload: platform.currentPlatform,
        });
      }
      await dispatch({
        type: 'platform/fetchPlatformList',
      });
      await dispatch({
        type: 'platform/saveModalVisible',
        payload: false,
      });
    }
  };

  const onFetch: Function = (d: Platform) => async () => {
    await dispatch({
      type: 'platform/saveFetchModalVisible',
      payload: true,
    });
    await dispatch({
      type: 'platform/fetchSiteArticles',
      payload: d,
    });
    await dispatch({
      type: 'platform/saveCurrentPlatform',
      payload: d,
    });
  };

  const onFetchModalCancel = () => {
    dispatch({
      type: 'platform/saveFetchModalVisible',
      payload: false,
    });
  };

  const onImport = async () => {
    await dispatch({
      type: 'platform/saveImportProgressModalVisible',
      payload: true,
    });
    await dispatch({
      type: 'platform/importArticles',
      payload: {
        platformId: platform.currentPlatform ? platform.currentPlatform._id : '',
        siteArticles: platform.siteArticles
          ? platform.siteArticles.filter((d: SiteArticle) => d.checked)
          : [],
      },
    });
  };

  const onAccount: Function = (d: Platform) => async () => {
    await dispatch({
      type: 'platform/saveAccountModalVisible',
      payload: true,
    });
    await dispatch({
      type: 'platform/saveCurrentPlatform',
      payload: d,
    });
    TDAPP.onEvent('平台管理-打开账户设置')
  };

  const onLogin = d => {
    // 打开登录窗口
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('login', { platform: d })
  }
  const onAccountModalCancel = async () => {
    await dispatch({
      type: 'platform/saveAccountModalVisible',
      payload: false,
    });
    TDAPP.onEvent('平台管理-取消账户设置')
  };

  const onAccountSave = async () => {
    await dispatch({
      type: 'platform/savePlatform',
      payload: platform.currentPlatform,
    });
    await dispatch({
      type: 'platform/saveAccountModalVisible',
      payload: false,
    });
    TDAPP.onEvent('平台管理-保存账户设置')
  };

  const getStatsComponent = (d: any) => {
    d.readNum = d.readNum || 0;
    d.likeNum = d.likeNum || 0;
    d.commentNum = d.commentNum || 0;
    return (
      <div>
        <Tooltip title={`阅读数: ${d.readNum.toString()}`}>
          <Tag color="green">{d.readNum}</Tag>
        </Tooltip>
        <Tooltip title={`点赞数: ${d.likeNum.toString()}`}>
          <Tag color="orange">{d.likeNum}</Tag>
        </Tooltip>
        <Tooltip title={`评论数: ${d.commentNum.toString()}`}>
          <Tag color="blue">{d.commentNum}</Tag>
        </Tooltip>
      </div>
    );
  };

  const columns: ColumnProps<any>[] = [
    {
      title: '图标',
      width: '80px',
      dataIndex: '_id',
      key: '_id',
      render: (text: string, d: Platform) => {
        let img = <span>Logo</span>;
        if (d.name === constants.platform.JUEJIN) {
          img = <img className={style.siteLogo} src={imgJuejin} />;
        } else if (d.name === constants.platform.SEGMENTFAULT) {
          img = <img className={style.siteLogo} src={imgSegmentfault} />;
        } else if (d.name === constants.platform.JIANSHU) {
          img = <img className={style.siteLogo} src={imgJianshu} />;
        } else if (d.name === constants.platform.CSDN) {
          img = <img className={style.siteLogo} src={imgCsdn} />;
        } else if (d.name === constants.platform.ZHIHU) {
          img = <img className={style.siteLogo} src={imgZhihu} />;
        } else if (d.name === constants.platform.OSCHINA) {
          img = <img className={style.siteLogo} src={imgOschina} />;
        } else if (d.name === constants.platform.TOUTIAO) {
          img = <img className={style.siteLogo} src={imgToutiao} />;
        } else if (d.name === constants.platform.CNBLOGS) {
          img = <img className={style.siteLogo} alt={d.label} src={imgCnblogs} />;
        } else if (d.name === constants.platform.V2EX) {
          img = <img className={style.siteLogo} alt={d.label} src={imgV2ex} />;
        } else if (d.name === constants.platform.WECHAT) {
          return <img className={style.siteLogo} alt={d.label} src={imgWechat} />;
        }
        return (
          <a href={d.url} target="_blank">
            {img}
          </a>
        )
      },
    },
    {
      title: '平台代号',
      dataIndex: 'name',
      key: 'name',
      width: '180px',
    },
    {
      title: '平台名称',
      dataIndex: 'label',
      key: 'label',
      width: '180px',
    },
    // {
    //   title: '平台描述',
    //   dataIndex: 'description',
    //   key: 'description',
    //   width: 'auto',
    //   render: text => {
    //     let shortText = text;
    //     if (text && text.length > 50) {
    //       shortText = `${shortText.substr(0, 50)}...`;
    //     }
    //     return (
    //       <div className={style.description} title={text}>
    //         {shortText}
    //       </div>
    //     );
    //   },
    // },
    {
      title: 'Cookie状态',
      dataIndex: 'cookieStatus',
      key: 'cookieStatus',
      width: '120px',
      render: (text: string, d: Platform) => {
        if (d.loggedIn) {
          return (
            <Tooltip title="可以发布文章到该平台">
              <Tag color="green">已导入</Tag>
            </Tooltip>
          )
        }
        if (d.name === constants.platform.WECHAT) {
          return (
            <Tooltip title="可以发布文章到该平台">
              <Tag color="green">不需导入</Tag>
            </Tooltip>
          )
        }
        return (
          <Tooltip title="请用登陆助手导入Cookie">
            <Tag color="red">未导入</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '180px',
      render: (text: string, d: Platform) => (
        <div>
          {/*<Tooltip title="导入文章">*/}
          {/*  <Button*/}
          {/*    disabled={!d.enableImport}*/}
          {/*    type="primary"*/}
          {/*    shape="circle"*/}
          {/*    icon="import"*/}
          {/*    className={style.fetchBtn}*/}
          {/*    onClick={onFetch(d)}*/}
          {/*  />*/}
          {/*</Tooltip>*/}
          {/* <Tooltip title="设置登陆用户名密码"> */}
          {/*  <Button */}
          {/*    disabled={!d.enableLogin} */}
          {/*    type="default" */}
          {/*    shape="circle" */}
          {/*    icon="key" */}
          {/*    className={style.loginBtn} */}
          {/*    onClick={onAccount(d)} */}
          {/*  /> */}
          {/* </Tooltip> */}
          { window.navigator.userAgent.indexOf('Electron') === -1 ? <></>:<Tooltip title="打开浏览器登录">
            <Button
              type="default"
              shape="circle"
              icon="user"
              className={style.settingBtn}
              onClick={() => onLogin(d)}
            />
          </Tooltip>}
          <Tooltip title="配置">
            <Button
              type="default"
              shape="circle"
              icon="setting"
              className={style.settingBtn}
              onClick={() => {
                setCurPlatform(d);
                setDrawerVisible(true)
              }}
            />
          </Tooltip>
          {/* <Popconfirm title="您确认删除该平台吗？" onConfirm={onDelete(d)}> */}
          {/*  <Button type="danger" shape="circle" icon="delete" className={style.delBtn}/> */}
          {/* </Popconfirm> */}
        </div>
      ),
    },
  ];

  const siteArticlesColumns: ColumnProps<any>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '400px',
      render: (text: string, d: SiteArticle) => (
        <a href={d.url} target="_blank">
          {text}
        </a>
      ),
    },
    {
      title: '存在状态',
      dataIndex: 'exists',
      key: 'exits',
      width: '80px',
      render: (text: string, d: SiteArticle) => {
        if (d.exists) {
          return <Tag color="green">已存在</Tag>;
        }
        return <Tag color="red">不存在</Tag>;
      },
    },
    {
      title: '关联状态',
      dataIndex: 'associated',
      key: 'associated',
      width: '80px',
      render: (text: string, d: SiteArticle) => {
        if (d.associated) {
          return <Tag color="green">已关联</Tag>;
        }
        return <Tag color="red">未关联</Tag>;
      },
    },
    {
      title: '数据统计',
      dataIndex: 'url',
      key: 'url',
      width: '200px',
      render: (text: string, d: SiteArticle) => getStatsComponent(d),
    },
  ];

  const onSiteArticleSelect: SelectionSelectFn<any> = async (
    d: any,
    selected: boolean,
    selectedSiteArticles: Object[],
    nativeEvent: Event,
  ) => {
    const siteArticles = platform.siteArticles || [];
    for (let i = 0; i < siteArticles.length; i++) {
      siteArticles[i].checked = selectedSiteArticles
        .map((d: any) => d.url)
        .includes(siteArticles[i].url);
    }
    await dispatch({
      type: 'platform/saveSiteArticles',
      payload: siteArticles,
    });
  };

  const onSiteArticleSelectAll = async (selected: boolean) => {
    const siteArticles = platform.siteArticles || [];
    for (let i = 0; i < siteArticles.length; i++) {
      siteArticles[i].checked = selected;
    }
    await dispatch({
      type: 'platform/saveSiteArticles',
      payload: siteArticles,
    });
  };

  const siteArticlesRowSelection: TableRowSelection<any> = {
    selectedRowKeys: platform.siteArticles
      ? platform.siteArticles.filter((d: SiteArticle) => d.checked).map((d: SiteArticle) => d.url)
      : [],
    onSelect: onSiteArticleSelect,
    onSelectAll: onSiteArticleSelectAll,
  };

  const getTip = () => {
    if (platform.fetchLoading) {
      return '正在获取文章列表，需要大约15-60秒，请耐心等待...';
    }
    if (platform.importLoading) {
      const articleNum = platform.siteArticles
        ? platform.siteArticles.filter(d => d.checked && (!d.exists || !d.associated)).length
        : 0;
      return `正在导入文章，需要大约${15 * articleNum}秒（每篇文章大约15秒），请耐心等待...`;
    }
    return '';
  };

  const onUpdateCookieStatus = () => {
    dispatch({
      type: 'platform/updateCookieStatus',
    })
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'platform/fetchPlatformList',
      });
    }

    TDAPP.onEvent('平台管理-访问页面');
  }, []);

  const onClose = () => {
    setDrawerVisible(false)
  }
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const provinceData = ['开发语言', '前端开发'];
  const cityData = {
    开发语言: ['java', 'Python', 'C++'],
    前端开发: ['html', 'css'],
  };

  const [cities, setCities] = useState(cityData[provinceData[0]]);
  const [secondCity, setSecondCity] = useState(cityData[provinceData[0]][0]);
  const handleProvinceChange = value => {
    setCities(cityData[value])
    setSecondCity(cityData[value][0])
  };
  const onSecondCityChange = value => {
    setSecondCity(value)
  };
  const getForm = () => {
    if (curPlatform && curPlatform.name === 'segmentfault') {
      return SegmentfaultSetting
    }
    if (curPlatform && curPlatform.name === 'zhihu') {
      return ZhihuSetting
    }
    if (curPlatform && curPlatform.name == 'oschina') {
      return OschinaSetting
    }
    if (curPlatform && curPlatform.name == 'jianshu') {
      return <Form>
        <Form.Item
          label="文集"
          name="footer"
          rules={[{ required: true, message: '请选择一个文集' }]}
        >
          <Select
            defaultValue={provinceData[0]}
            style={{ minWidth: 120 }}
            onChange={handleProvinceChange}
          >
            {provinceData.map(province => (
              <Option key={province}>{province}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    }
    if (curPlatform && curPlatform.name == 'cnblogs') {
      const remind = <span>提示： 请先在 <a href="https://i.cnblogs.com/Preferences.aspx#Editor">博客园配置</a> 页，设置编辑器为 "Markdown"</span>
      return <Form>
        <Alert message={remind} type="warning" />
        <Form.Item
          label="个人分类"
          name="footer"
          rules={[{ required: true, message: '请选择一个分类' }]}
        >
          <Select
            defaultValue={provinceData[0]}
            style={{ minWidth: 120 }}
            onChange={handleProvinceChange}
          >
            {provinceData.map(province => (
              <Option key={province}>{province}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="发布选项"
          name="footer"
          rules={[{ required: true, message: '请选择一个分类' }]}
        >
          <Checkbox.Group style={{ width: '100%' }} onChange={() => {}}>
            <Row>
              <Col span={6}>
                <Checkbox value="A">发布至首页候选区</Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value="B">发布至博客园首页</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item
          label="高级选项"
          name="footer"
          rules={[{ required: true, message: '请选择一个分类' }]}
        >
          <Checkbox.Group style={{ width: '100%' }} onChange={() => {}}>
            <Row>
              <Col span={3}>
                <Checkbox value="A">发布</Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value="B">显示在我的博客首页</Checkbox>
              </Col>
              <Col span={4}>
                <Checkbox value="B">允许评论</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="B">显示在RSS中</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="B">只允许注册用户</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item
          label="摘要"
          name="footer"
          rules={[{ required: true, message: '请输入话题' }]}
        >
          <Input.TextArea placeholder="请输入文章摘要"/>
        </Form.Item>

        <Form.Item
          label="文章标签"
          name="footer"
          rules={[{ required: true, message: '' }]}
        >
          <Select
            defaultValue={provinceData[0]}
            style={{ minWidth: 120 }}
            onChange={handleProvinceChange}
          >
            {provinceData.map(province => (
              <Option key={province}>{province}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    }
    if (curPlatform && curPlatform.name == 'csdn') {
     return <Form>
        <Form.Item
          required
          label="文章类型:"
          name="articleType"
          rules={[{ required: true, message: '请输入文章类型' }]}
        >
          <Radio.Group>
            <Radio value="a">原创</Radio>
            <Radio value="b">转载</Radio>
            <Radio value="c">翻译</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          required
          label="原文地址:"
          name="footer"
          rules={[{ required: true, message: '请输入原文地址:' }]}
        >
          <Input placeholder="请输入原文地址"/>
        </Form.Item>
       <Form.Item
         required
         label="发布形式:"
         name="articleType"
         rules={[{ required: true, message: '请选择发布形式' }]}
       >
         <Radio.Group>
           <Radio value="a">公开</Radio>
           <Radio value="b">私密</Radio>
           <Radio value="c">粉丝可见</Radio>
           <Radio value="c">Vip可见</Radio>
         </Radio.Group>
       </Form.Item>
        <Form.Item
          required
          label="个人分类:"
          name="footer"
          rules={[{ required: true, message: '请输入个人分类:' }]}
        >
          <Row>
            <Col span={12}>
              <Select
                defaultValue={provinceData[0]}
                style={{ minWidth: 120 }}
                onChange={handleProvinceChange}
              >
                {provinceData.map(province => (
                  <Option key={province}>{province}</Option>
                ))}
              </Select>
            </Col>
            <Col span={12}><Select
              style={{ paddingLeft: 10, minWidth: 120 }}
              value={secondCity}
              onChange={onSecondCityChange}
            >
              {cities.map(city => (
                <Option key={city}>{city}</Option>
              ))}
            </Select></Col>
          </Row>


        </Form.Item>
        <Form.Item
          required
          label="文章标签"
          name="footer"
          rules={[{ required: true, message: '' }]}
        >
          <Select
            defaultValue={provinceData[0]}
            style={{ minWidth: 120 }}
            onChange={handleProvinceChange}
          >
            {provinceData.map(province => (
              <Option key={province}>{province}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    }
    if (curPlatform && curPlatform.name == 'juejin') {
      return JuejinSetting
    }
    if (curPlatform && curPlatform.name == constants.platform.TOUTIAO) {
      return <Form>
        <Form.Item
          label="广告投放"
          name="footer"
          rules={[{ required: true, message: '请选择是否投放广告' }]}
        >
          <Checkbox.Group style={{ width: '100%' }} onChange={() => {}}>
            <Row>
              <Col span={4}>
                <Checkbox value="A">投放头条广告</Checkbox>
              </Col>
              <Col span={4}>
                <Checkbox value="B">不投放广告</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    }
  }
  const getAlertMsg = () => {
    if (curPlatform && curPlatform.loggedIn) {
      return '已导入'
    }
    if (curPlatform && curPlatform.name === constants.platform.WECHAT) {
      return '不需要导入'
    }
    return '未导入'
  }
  const getAlertType = () => {
    if (curPlatform && curPlatform.loggedIn) {
      return 'success'
    }
    if (curPlatform && curPlatform.name === constants.platform.WECHAT) {
      return 'success'
    }
    return 'warning'
  }
  const pageProps = window.navigator.userAgent.indexOf('Electron') !== -1 ? {
    pageHeaderRender: false,
    title: false,
    // style: {display: 'none'}
  } : {}
  const dataSource = platform.platforms;
  return (
    <PageHeaderWrapper {...pageProps}>
      <Drawer
        title={`${curPlatform ? curPlatform.name : '平台'} 配置项`}
        width={720}
        onClose={onClose}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={onClose} type="primary">
              Submit
            </Button>
          </div>
        }
      >
        <Alert message={getAlertMsg()} type={getAlertType()} showIcon></Alert>
        <Divider orientation="left">平台配置</Divider>
        {getForm()}
        <Divider orientation="left">文章配置</Divider>
        <Form>
          <Form.Item
            label="底部配置（Markdown格式）:"
            name="footer"
            rules={[{ required: true, message: '请输入底部配置' }]}
          >
            <Input.TextArea rows={4}
                            placeholder={'> 本文由博客一文多发平台 [Artipub](https://github.com/crawlab-team/artipub) 发布！'} />
          </Form.Item>
        </Form>
      </Drawer>
      <Modal
        title={platform.currentPlatform && platform.currentPlatform._id ? '更改平台' : '新增平台'}
        visible={platform.modalVisible}
        onOk={onSave}
        onCancel={onModalCancel}
      >
        <Form labelCol={{ sm: { span: 4 } }} wrapperCol={{ sm: { span: 20 } }}>
          <Form.Item label="代号">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.name : ''}
              onChange={onFieldChange(constants.inputType.INPUT, 'name')}
            />
          </Form.Item>
          <Form.Item label="名称">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.label : ''}
              onChange={onFieldChange(constants.inputType.INPUT, 'label')}
            />
          </Form.Item>
          <Form.Item label="编辑器类别">
            <Select
              value={platform.currentPlatform ? platform.currentPlatform.editorType : ''}
              onChange={onFieldChange(constants.inputType.SELECT, 'editorType')}
            >
              <Select.Option key={constants.editorType.MARKDOWN}>Markdown</Select.Option>
              <Select.Option key={constants.editorType.RICH_TEXT}>富文本编辑</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea
              value={platform.currentPlatform ? platform.currentPlatform.description : ''}
              onChange={onFieldChange(constants.inputType.INPUT, 'description')}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="导入文章"
        visible={platform.fetchModalVisible}
        width="1000px"
        closable={false}
        maskClosable={false}
        onOk={onImport}
        okText="导入"
        onCancel={onFetchModalCancel}
        okButtonProps={{
          disabled: platform.fetchLoading,
          loading: platform.importLoading,
        }}
        cancelButtonProps={{
          disabled: platform.fetchLoading || platform.importLoading,
        }}
      >
        <Spin spinning={platform.fetchLoading || platform.importLoading} tip={getTip()}>
          <Table
            rowSelection={siteArticlesRowSelection}
            dataSource={
              platform.siteArticles
                ? platform.siteArticles.map((d: SiteArticle) => ({
                  key: d.url,
                  ...d,
                }))
                : []
            }
            columns={siteArticlesColumns}
          />
        </Spin>
      </Modal>
      <Modal
        visible={platform.accountModalVisible}
        onCancel={onAccountModalCancel}
        onOk={onAccountSave}
      >
        <Form>
          <Form.Item label="登陆用户名">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.username : ''}
              placeholder="请输入登陆用户名"
              onChange={onFieldChange(constants.inputType.INPUT, 'username')}
            />
          </Form.Item>
          <Form.Item label="登陆密码">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.password : ''}
              type="password"
              placeholder="请输入登陆密码"
              onChange={onFieldChange(constants.inputType.INPUT, 'password')}
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* <div className={style.actions}> */}
      {/*  <Button className={style.addBtn} type="primary" onClick={onAdd}>添加平台</Button> */}
      {/* </div> */}
      <div style={{ textAlign: 'right', marginBottom: '10px', paddingTop: '10px' }}>
        <Button
          type="primary"
          loading={platform.updateCookieStatusLoading}
          onClick={onUpdateCookieStatus}
          icon="sync"
        >
          更新Cookie状态
        </Button>
      </div>
      {window.navigator.userAgent.indexOf('Electron') === -1 ?
        <Card><Table dataSource={dataSource} columns={columns} /></Card> :
        <Table dataSource={platform.platforms} columns={columns} />}
    </PageHeaderWrapper>
  );
};

export default connect(({ platform }: ConnectState) => ({
  platform,
}))(PlatformList);
