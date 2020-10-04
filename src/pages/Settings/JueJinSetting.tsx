import {Form, Select} from "antd";
import React from "react";

const JuejinSetting = (props)=>{
  const CategoryChildren = [];
  console.log(props.category)
  for (let i = 0; i < props.category.length; i++) {
    CategoryChildren.push(<Option key={i.toString()}>{props.category[i]}</Option>);
  }
  return <Form>
    <Form.Item
      label="文章分类"
      name="footer"
      rules={[{required: true, message: '请选择一个文章分类'}]}
    >
      <Select
        style={{minWidth: 120}}
        // onChange={handleProvinceChange}
      >
        {CategoryChildren}
      </Select>
    </Form.Item>
    <Form.Item
      label="文章标签"
      name="footer"
      rules={[{required: true, message: '请选择一个文章标签'}]}
    >
      <Select
        mode="multiple"
        // defaultValue={provinceData[0]}
        style={{minWidth: 120}}
        // onChange={handleProvinceChange}
      >
        {CategoryChildren}
      </Select>
    </Form.Item>
  </Form>;
}
export default JuejinSetting;
