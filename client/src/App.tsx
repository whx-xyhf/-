import React from 'react';
import './App.css';
import ScatterPlot from './components/ScatterPlot';
import ForceCompute from './components/ForceCompute';
import NodeList from './components/NodeList';
import Info from './components/Info';
import Parallel from './components/Parallel';
import DrawPanel from './components/DrawPanel';
import { Slider, InputNumber, Row, Col, Button ,Checkbox} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';


// import * as axios from 'axios'
// import  * as d3 from 'd3';

type ChoosePointData = {
  id: number,
  nodes: Array<number>,
  edges: Array<edges>,
  [propName: string]: any,
}
type edges = Array<number>;
type attr={
  [propName: string]: any,
}

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      choosePoints: [],//圈选的点
      personGraphs: [],//选中的人所在的子图
      centerPoint: {},//点击的点
      nodeLinkDisplay: 'block',
      tableDisplay: 'none',
      dimensions: 128,//向量维度
      num: 10,//匹配的限制数量
      strWeight: 0,//拓扑权重
      attrWeight: 1,//属性权重
      strWeight_slider: 0,//拓扑权重(保存滑块的值)
      attrWeight_slider: 1,//属性权重(保存滑块的值)
      attr: {},//属性及对应的最大范围
      attrSliderValue:{},//属性slider选择的范围
      attrValue:{},//确认时属性的范围
      attrChecked:{},//属性checkbox状态
      attrCheckedBox:{},//临时保存checkbox的值
    }
    this.setChoosePoints = this.setChoosePoints.bind(this);
    this.setPersonGraphs = this.setPersonGraphs.bind(this);
    this.setCenterPoint = this.setCenterPoint.bind(this);
    this.showNodeLink = this.showNodeLink.bind(this);
    this.showTable = this.showTable.bind(this);
    this.changeStrWeight = this.changeStrWeight.bind(this);
    this.changeAttrWeight = this.changeAttrWeight.bind(this);
    this.changeWeight = this.changeWeight.bind(this);
    this.changeNum = this.changeNum.bind(this);
    this.setAttr = this.setAttr.bind(this);
    this.setAttrChecked=this.setAttrChecked.bind(this);
    this.setAttrCheckedBox=this.setAttrCheckedBox.bind(this);
    this.initAttrChecked=this.initAttrChecked.bind(this);
  }
  setChoosePoints(data: ChoosePointData) {
    this.setState({ choosePoints: data });
  }
  setPersonGraphs(data: ChoosePointData) {
    this.setState({ personGraphs: data });
  }
  setCenterPoint(data: ChoosePointData) {
    this.setState({ centerPoint: data });
  }
  //展示力导图
  showNodeLink() {
    this.setState({ nodeLinkDisplay: 'block', tableDisplay: 'none' });
  }
  //展示比较表格
  showTable() {
    this.setState({ nodeLinkDisplay: 'none', tableDisplay: 'block' });
  }
  //设置匹配数量
  setNum(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ num: e.target.value });
  }
  //设置维度
  setDimensions(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ dimensions: e.target.value, choosePoints: [] });
  }
  //设置结构权重滑块
  changeStrWeight(value: string | number | null | undefined): void {
    this.setState({ strWeight_slider: value, attrWeight_slider: typeof value === 'number' ? Number((1 - value).toFixed(1)) : 0 })
  }
  //设置属性权重滑块
  changeAttrWeight(value: string | number | null | undefined): void {

    this.setState({ attrWeight_slider: value, strWeight_slider: typeof value === 'number' ? Number((1 - value).toFixed(1)) : 0 })
  }
  changeNum(value: string | number | null | undefined): void {
    this.setState({ num: value });
  }
  //确认权重
  changeWeight(): void {
    const { strWeight_slider, attrWeight_slider } = this.state;
    this.setState({ strWeight: strWeight_slider, attrWeight: attrWeight_slider, choosePoints: [], centerPoint: {} });
  }
  //设置属性类型
  setAttr(value: attr): void {
    let value2=JSON.parse(JSON.stringify(value));
    let value3=JSON.parse(JSON.stringify(value));
    this.setState({ attr: value,attrSliderValue:value2 ,attrValue:value3});
  }
  setOneAttrSliderValue(key:string,value:any){
    let attrSliderValue=this.state.attrSliderValue;
    attrSliderValue[key]=value;
    this.setState({attrSliderValue:attrSliderValue});
  }
  //设置属性范围
  setAttrValue(key:string,value:any){
    let attrValue=this.state.attrValue;
    attrValue[key]=value;
    this.setState({attrValue:JSON.parse(JSON.stringify(attrValue))});
  }
  //设置属性状态
  initAttrChecked(value:any):void{
    let value2=JSON.parse(JSON.stringify(value));
    this.setState({attrChecked:value,attrCheckedBox:value2});
  }
  //设置属性状态
  setAttrChecked():void{
    let attrCheckedBox=JSON.parse(JSON.stringify(this.state.attrCheckedBox));
    this.setState({attrChecked:attrCheckedBox,choosePoints: [], centerPoint: {}});
  }
  //设置checkbox的状态
  setAttrCheckedBox(key:string,e:CheckboxChangeEvent):void{
    let attrCheckedBox=JSON.parse(JSON.stringify(this.state.attrCheckedBox));
    attrCheckedBox[key]=e.target.checked;
    this.setState({attrCheckedBox:attrCheckedBox});
  }
  render(): React.ReactElement {
    const { strWeight_slider, attrWeight_slider, dimensions, strWeight, attrWeight, num, choosePoints, 
      centerPoint, personGraphs, attr,attrSliderValue,attrValue, attrChecked, attrCheckedBox } = this.state;
    let attrEl: Array<React.ReactElement> = [];
    for(let key in attr){
      attrEl.push(
        <Row key={key} style={{height:'27px'}}>
          <Col span={2}>
          <Checkbox checked={key in attrCheckedBox?attrCheckedBox[key]:false} onChange={this.setAttrCheckedBox.bind(this,key)}></Checkbox>
          </Col>
          <Col span={8}>{key}:</Col>
          <Col span={8}>
            <Slider
              min={Math.floor(attr[key][0])}
              max={Math.floor(attr[key][1])}
              tipFormatter={null}
              step={1}
              range
              // marks={{0:String(Math.floor(value[0])),100:String(Math.floor(value[1]))}}
              // defaultValue={[Math.floor(value[0]),Math.floor(value[1])]}
              value={[Math.floor(attrSliderValue[key][0]),Math.floor(attrSliderValue[key][1])]}
              style={{position:'relative',top:'-2px'}}
              onChange={this.setOneAttrSliderValue.bind(this,key)}
              onAfterChange={this.setAttrValue.bind(this,key)}
            />
            <span style={{position:'absolute',bottom:'-4px',left:0,fontSize:'0.3rem'}}>{Math.floor(attr[key][0])}</span>
            <span style={{position:'absolute',bottom:'-4px',right:0,fontSize:'0.3rem'}}>{Math.floor(attr[key][1])}</span>
          </Col>
          <Col span={6}>
            <span>{Math.floor(attrSliderValue[key][0])}</span>
            <span>-</span>
            <span>{Math.floor(attrSliderValue[key][1])}</span>
          </Col>
          
        </Row>
      )
    }
    return (
      <div className="App">

        <div className="controlView">
          <div className="controlPanel">
            <div className="title"></div>
            <div className="content">
              <Row style={{height:'27px'}}>
                <Col span={7}>Dimensions:</Col>
                <Col span={10}>
                  <Slider
                    min={2}
                    max={1000}
                    value={128}
                    tipFormatter={null}
                    step={1}
                    style={{position:'relative',top:'-2px'}}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={2}
                    max={1000}
                    size='small'
                    style={{ margin: '0 16px', width: '100%' }}
                    value={128}
                  />
                </Col>
              </Row>
              <Row style={{height:'27px'}}>
                <Col span={7}>Str-Weight:</Col>
                <Col span={10}>
                  <Slider
                    min={0}
                    max={1}
                    onChange={this.changeStrWeight}
                    value={typeof strWeight_slider === 'number' ? strWeight_slider : 0}
                    tipFormatter={null}
                    step={0.1}
                    style={{position:'relative',top:'-2px'}}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0}
                    max={1}
                    size='small'
                    style={{ margin: '0 16px', width: '100%' }}
                    value={strWeight_slider}
                    onChange={this.changeStrWeight}
                  />
                </Col>
              </Row>
              <Row style={{height:'27px'}}>
                <Col span={7}>Attr-Weight:</Col>
                <Col span={10}>
                  <Slider
                    min={0}
                    max={1}
                    onChange={this.changeAttrWeight}
                    value={typeof attrWeight_slider === 'number' ? attrWeight_slider : 0}
                    tipFormatter={null}
                    step={0.1}
                    style={{position:'relative',top:'-2px'}}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0}
                    max={1}
                    size='small'
                    style={{ margin: '0 16px', width: '100%' }}
                    value={attrWeight_slider}
                    onChange={this.changeAttrWeight}
                  />
                </Col>
              </Row>
              <Row style={{height:'27px'}}>
                <Col span={7}>Match count:</Col>
                <Col span={10}>
                  <Slider
                    min={1}
                    max={20}
                    onChange={this.changeNum}
                    value={typeof num === 'number' ? num : 0}
                    tipFormatter={null}
                    step={1}
                    style={{position:'relative',top:'-2px'}}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={1}
                    max={20}
                    size='small'
                    style={{ margin: '0 16px', width: '100%' }}
                    value={num}
                    onChange={this.changeNum}
                  />
                </Col>
              </Row>
              <Row style={{height:'27px'}}>
                <Col><Button onClick={this.changeWeight} style={{ margin: '0 5px' }} size='small'>search</Button></Col>
              </Row>
            </div>
          </div>
          <div className="filter">
            <div className="title"></div>
            <div className="content">
              {attrEl}
              <Row>
                <Col><Button onClick={this.setAttrChecked} style={{ margin: '0 5px' }} size='small'>search</Button></Col>
              </Row>
            </div>
          </div>
          <div className="drawPanel">
            <div className="title"></div>
            <DrawPanel url='http://localhost:8080/matchModel' num={num} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
              attrChecked={attrChecked} attrValue={attrValue} parent={{setChoosePoints:this.setChoosePoints}}/>
          </div>

          {/* <div className='nodelistView'>
            <NodeList url="http://localhost:8080" parent={this.setPersonGraphs.bind(this)} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}/>
          </div> */}

        </div>

        <div className="right">
          <div className="infoView">
            <div className="title"></div>
            <div className="content">
              <Info graphs={personGraphs} url='http://localhost:8080' num={num} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
               attrChecked={attrChecked} attrValue={attrValue} parent={{ setChoosePoints: this.setChoosePoints.bind(this), setCenterPoint: this.setCenterPoint.bind(this) }} />
            </div>
          </div>

          <div className="scatterView">
            <div className="title"></div>
            <div className="content">
              <ScatterPlot url="http://localhost:8080" choosePoints={choosePoints} centerPoint={centerPoint}
                dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight} attrChecked={attrChecked} attrValue={attrValue}
                parent={{ setChoosePoints: this.setChoosePoints.bind(this), setPersonGraphs: this.setPersonGraphs.bind(this) }} />
            </div>
          </div>

          <div className="forceComputeView">
            <div className='title'></div>
            <div className='content'>
              <ForceCompute graphs={choosePoints} display={this.state.nodeLinkDisplay} />
            </div>
          </div>

          <div className="parallelView">
            <div className='title'></div>
            <div className='content'>
              <Parallel url="http://localhost:8080/getAttr" choosePoints={choosePoints} centerPoint={centerPoint} 
              attrWeight={attrWeight} attrChecked={attrChecked} attrValue={attrValue}
              parent={{ setAttr: this.setAttr,initAttrChecked:this.initAttrChecked }} />
            </div>
          </div>
        </div>

      </div>
    );
  }

}

export default App;
