import React, {useEffect, useState} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Alert, Button, Card, Row} from "antd";
import style from './Helper.scss'

const Helper: React.FC<any> = () => {
  const [isInstall, setIsInstall] = useState(false);
  const [version, setVersion] = useState("0.0.0");
  useEffect(()=>{
    window.postMessage({ type: "GET_VERSION" }, "*");

    window.addEventListener("message", function(event) {
      if (event.data.type === "Give_Your_Version") {
        setIsInstall(true)
        setVersion(event.data.value)
        // var div = document.createElement("div");
        // div.id = "version"
        // div.innerText = "Version:" + event.data.value
        // console.log("install version" + event.data.value)
        // document.body.appendChild(div)
      } else if (event.data.type === "Give_Your_ONE_COOKIE") {
        // var div2 = document.createElement("div");
        // div2.innerText =
        //   JSON.stringify(event.data.value)
        // document.body.appendChild(div2)
      } else if (event.data.type == "Give_Your_Response"){
        // console.log(event.data.value)
      }
    }, false);
  },[])

  const onDownload = () => {
    window.location.pathname = '/artipub-helper.zip';
    TDAPP.onEvent('登陆助手-下载登陆助手');
  };

  TDAPP.onEvent('登陆助手-访问页面');
  const getAlertMsg = ()=>{


    if(isInstall){
      return <div>Artipub Chrome 插件已成功连接，当前运行版本{version} </div>
    }else {
        return <div>Artipub Chrome 插件连接失败，请下载最新Chrome浏览器</div>
    }
  }
  const getAlertType = ()=>{
    if(isInstall){
      return 'success'
    }else {
      return 'error'
    }
  }
  return (
    <PageHeaderWrapper>
      <Row style={{textAlign: 'right'}}>
        <Button type="primary" onClick={onDownload}>下载登陆助手</Button>
      </Row>
      <Row style={{marginTop: '20px'}}>
        <Alert message={getAlertMsg()} type={getAlertType()} showIcon></Alert>
        <Card>
          <h3>登陆助手使用步骤</h3>
          <ul className={style.step}>
            <li>1. 点击<b>"下载登陆助手"</b>，保存文件名为"artipub-helper.zip"</li>
            <li>2. 在Chrome浏览器中输入<a href="chrome://extensions" target="_blank">chrome://extensions</a>，并开启<b>开发者模式</b>（点击右上角）</li>
            <li>3. 将下载的登陆助手文件artipub-helper.zip<b>拖入浏览器中</b>，浏览器将自动安装插件（如果不能拖拽，请刷新页面后重试）</li>
            <li>4. 在使用登陆助手之前，请确保您的各个平台账号已经处于<b>登陆状态</b></li>
            <li>5. 右上角点击安装好的插件图标，点击<b>"一键获取登陆信息"</b>，插件将获取所有平台的Cookie</li>
            <li style={{color: 'red'}}>注意⚠️: 如果您的服务器没有部署在本机，请点击"扳手"按钮，输入服务器的IP地址+端口号（默认3000），然后再获取登陆信息</li>
            <li>6. 到"平台管理"页面，点击"更新Cookie状态"（需要大约1分钟），然后查看"Cookie状态"，确保其为<b>"已导入"</b>状态</li>
            <li>7. 到"文章管理"页面，点击"发布"，选择登陆方式为"Cookie"，然后发布文章</li>
          </ul>
        </Card>
      </Row>
    </PageHeaderWrapper>
  );
};

export default Helper;
