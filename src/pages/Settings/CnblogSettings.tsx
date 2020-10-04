import {Alert, Form, Select} from "antd";
import React from "react";

const CnblogSetting = (props)=>{
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

export default CnblogSetting
