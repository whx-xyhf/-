import React from 'react';
import './App.css';
import ScatterPlot from './components/ScatterPlot';
import ForceCompute from './components/ForceCompute';
import NodeList from './components/NodeList';
import Info from './components/Info';
import Parallel from './components/Parallel';
import { Slider, InputNumber, Row, Col ,Button} from 'antd';
import { tickStep } from 'd3';

// import * as axios from 'axios'
// import  * as d3 from 'd3';

type ChoosePointData ={
  id: number,
  nodes: Array<number>,
  edges:Array<edges>,
  [propName:string]:any,
}
type edges=Array<number>;

class App extends React.Component<any,any> {
  constructor(props:any){
    super(props)
    this.state={
      choosePoints:[],//圈选的点
      personGraphs:[],//选中的人所在的子图
      centerPoint:{},//点击的点
      nodeLinkDisplay:'block',
      tableDisplay:'none',
      dimensions:128,//向量维度
      num:10,//匹配的限制数量
      strWeight:0,//拓扑权重
      attrWeight:1,//属性权重
      strWeight_slider:0,//拓扑权重(保存滑块的值)
      attrWeight_slider:1,//属性权重(保存滑块的值)
    }
    this.setChoosePoints=this.setChoosePoints.bind(this);
    this.setPersonGraphs=this.setPersonGraphs.bind(this);
    this.setCenterPoint=this.setCenterPoint.bind(this);
    this.showNodeLink=this.showNodeLink.bind(this);
    this.showTable=this.showTable.bind(this);
    this.changeStrWeight=this.changeStrWeight.bind(this);
    this.changeAttrWeight=this.changeAttrWeight.bind(this);
    this.changeWeight=this.changeWeight.bind(this);
    this.changeNum=this.changeNum.bind(this);
  }
  setChoosePoints(data:ChoosePointData){
    this.setState({choosePoints:data});
  }
  setPersonGraphs(data:ChoosePointData){
    this.setState({personGraphs:data});
  }
  setCenterPoint(data:ChoosePointData){
    this.setState({centerPoint:data});
  }
  //展示力导图
  showNodeLink(){
    this.setState({nodeLinkDisplay:'block',tableDisplay:'none'});
  }
  //展示比较表格
  showTable(){
    this.setState({nodeLinkDisplay:'none',tableDisplay:'block'});
  }
  //设置匹配数量
  setNum(e:React.ChangeEvent<HTMLInputElement>):void{
    this.setState({num:e.target.value});
  }
  //设置维度
  setDimensions(e:React.ChangeEvent<HTMLInputElement>):void{
    this.setState({dimensions:e.target.value,choosePoints:[]});
  }
  //设置结构权重滑块
  changeStrWeight(value:string | number | null | undefined):void{
    this.setState({strWeight_slider:value,attrWeight_slider:typeof value === 'number' ? Number((1-value).toFixed(1)) : 0})
  }
  //设置属性权重滑块
  changeAttrWeight(value:string | number | null | undefined):void{

    this.setState({attrWeight_slider:value,strWeight_slider:typeof value === 'number' ? Number((1-value).toFixed(1)) : 0})
  }
  changeNum(value:string | number | null | undefined):void{
    this.setState({num:value});
  }
  //确认权重
  changeWeight():void{
    const {strWeight_slider,attrWeight_slider} =this.state;
    this.setState({strWeight:strWeight_slider,attrWeight:attrWeight_slider,choosePoints:[],centerPoint:{}});
  }
  render():React.ReactElement{
    const {strWeight_slider,attrWeight_slider,dimensions,strWeight,attrWeight,num,choosePoints,centerPoint,personGraphs} =this.state;
    return (
      <div className="App">

        <div className="controlView">
          <div className='control'>
            {/* 维度：<input type="text" value={this.state.dimensions} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setDimensions(e)}/> <br></br>
            数量：<input type="text" value={this.state.num} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setNum(e)}/> */}
            <Row>
              <Col span={7}>Str-Weight:</Col>
              <Col span={10}>
                <Slider
                  min={0}
                  max={1}
                  onChange={this.changeStrWeight}
                  value={typeof strWeight_slider === 'number' ? strWeight_slider : 0}
                  tipFormatter={null}
                  step={0.1}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={0}
                  max={1}
                  size='small'
                  style={{ margin: '0 16px', width:'100%'}}
                  value={strWeight_slider}
                  onChange={this.changeStrWeight}
                />
                </Col>
            </Row>
            <Row>
              <Col span={7}>Attr-Weight:</Col>
              <Col span={10}>
                  <Slider
                    min={0}
                    max={1}
                    onChange={this.changeAttrWeight}
                    value={typeof attrWeight_slider === 'number' ? attrWeight_slider : 0}
                    tipFormatter={null}
                    step={0.1}
                  />
                </Col>
              <Col span={4}>
                <InputNumber
                  min={0}
                  max={1}
                  size='small'
                  style={{ margin: '0 16px' ,width:'100%'}}
                  value={attrWeight_slider}
                  onChange={this.changeAttrWeight}
                />
              </Col>
            </Row>
            <Row>
              <Col span={7}>Match count:</Col>
              <Col span={10}>
                  <Slider
                    min={1}
                    max={20}
                    onChange={this.changeNum}
                    value={typeof num === 'number' ? num : 0}
                    tipFormatter={null}
                    step={1}
                  />
                </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={20}
                  size='small'
                  style={{ margin: '0 16px' ,width:'100%'}}
                  value={num}
                  onChange={this.changeNum}
                />
              </Col>
            </Row>
            <Row>
              <Col><Button onClick={this.changeWeight} style={{margin:'0 5px'}}>search</Button></Col>
            </Row>
          </div>
          
          <div className='nodelistView'>
            <NodeList url="http://localhost:8080" parent={this.setPersonGraphs.bind(this)} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}/>
          </div>
          
        </div>

        <div className="infoView">
          <Info graphs={personGraphs} url='http://localhost:8080' num={num}  dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
          parent={{setChoosePoints:this.setChoosePoints.bind(this),setCenterPoint:this.setCenterPoint.bind(this)}}/>
        </div>

        <div className="scatterView">
          <ScatterPlot url="http://localhost:8080" choosePoints={choosePoints} centerPoint={centerPoint} 
          dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
          parent={{setChoosePoints:this.setChoosePoints.bind(this),setPersonGraphs:this.setPersonGraphs.bind(this)}}/>
        </div>
        
        <div className="forceComputeView">
          <div className='title'>
            
          </div>
          <div className='content'>
            <ForceCompute graphs={choosePoints} display={this.state.nodeLinkDisplay}/>
          </div>
        </div>

        <div className="parallelView">
          <Parallel url="http://localhost:8080/getAttr" choosePoints={choosePoints} centerPoint={centerPoint}/>
        </div>

      </div>
    );
  }
  
}

export default App;
