import React, { ChangeEvent } from 'react';
import './App.css';
import ScatterPlot from './components/ScatterPlot';
import ForceCompute from './components/ForceCompute';
import Info from './components/Info';
import Parallel from './components/Parallel';
import DrawPanel from './components/DrawPanel';
import DisTributeAttr from './components/DistributeAttr';
import { Slider, InputNumber, Row, Col, Button, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import axios from 'axios'


type ChoosePointData = {
  id: number,
  // nodes: Array<number>,
  // edges: Array<edges>,
  [propName: string]: any,
}
type edges = Array<number>;
type attr = {
  [propName: string]: any,
}

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      // dataType:'Author',//数据集名称
      dataType:'Family',//数据集名称
      reTsneData:[],//重新降维的数据
      choosePoints: [],//圈选的点
      personGraphs: [],//选中的人所在的子图
      centerPoint: {},//点击的点
      dimensions: 128,//向量维度
      num: 8,//匹配的限制数量
      strWeight: 1,//拓扑权重
      attrWeight: 0,//属性权重
      strWeight_slider: 1,//拓扑权重(保存滑块的值)
      attrWeight_slider: 0,//属性权重(保存滑块的值)
      attr: {},//属性及对应的最大范围
      attrSliderValue: {},//属性slider选择的范围
      attrValue: {},//确认时属性的范围
      attrChecked: {},//属性checkbox状态
      attrCheckedBox: {},//临时保存checkbox的值
      attrList:[],//所有属性字段
      strList:[],//所有结构字段
      
      displaySlider: '0',//显示属性调节滑块
      displayDrawPanel:'0',//显示画板

      attr_x:'',
      attr_y:'',
      str_x:'',
      str_y:'',
    }
    this.setDataType=this.setDataType.bind(this);
    this.setReTsneData=this.setReTsneData.bind(this);
    this.setChoosePoints = this.setChoosePoints.bind(this);
    this.setPersonGraphs = this.setPersonGraphs.bind(this);
    this.setCenterPoint = this.setCenterPoint.bind(this);
    this.changeStrWeight = this.changeStrWeight.bind(this);
    this.changeAttrWeight = this.changeAttrWeight.bind(this);
    this.changeWeight = this.changeWeight.bind(this);
    this.changeNum = this.changeNum.bind(this);
    this.setAttr = this.setAttr.bind(this);
    this.setAttrChecked = this.setAttrChecked.bind(this);
    this.setAttrCheckedBox = this.setAttrCheckedBox.bind(this);
    this.initAttrChecked = this.initAttrChecked.bind(this);
    this.setAttrDisplaySlider = this.setAttrDisplaySlider.bind(this);
    this.setStrDisplaySlider = this.setStrDisplaySlider.bind(this);
    this.setAttrList=this.setAttrList.bind(this);
    this.setStrList=this.setStrList.bind(this);
    this.setStrX=this.setStrX.bind(this);
    this.setStrY=this.setStrY.bind(this);
    this.setAttrX=this.setAttrX.bind(this);
    this.setAttrY=this.setAttrY.bind(this);
    this.match=this.match.bind(this);
  }
  setDataType(e: ChangeEvent<HTMLSelectElement>):void{
    let value = e.target.value;
    
    this.setState({dataType:value});
  }
  setReTsneData(data:ChoosePointData):void{
    this.setState({reTsneData:JSON.parse(JSON.stringify(data))});
  }
  setChoosePoints(data: ChoosePointData) :void{
    this.setState({ choosePoints: data });
  }
  setPersonGraphs(data: ChoosePointData) :void{
    this.setState({ personGraphs: data });
  }
  setCenterPoint(data: ChoosePointData) :void{
    this.setState({ centerPoint: data });
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
    let value2 = JSON.parse(JSON.stringify(value));
    let value3 = JSON.parse(JSON.stringify(value));
    this.setState({ attr: value, attrSliderValue: value2, attrValue: value3 });
  }
  setOneAttrSliderValue(key: string, value: any) :void{
    let attrSliderValue = this.state.attrSliderValue;
    attrSliderValue[key] = value;
    this.setState({ attrSliderValue: attrSliderValue });
  }
  //设置属性范围
  setAttrValue(key: string, value: any) :void{
    let attrValue = this.state.attrValue;
    attrValue[key] = value;
    this.setState({ attrValue: JSON.parse(JSON.stringify(attrValue)) });
  }
  //设置属性状态
  initAttrChecked(value: any): void {
    let value2 = JSON.parse(JSON.stringify(value));
    this.setState({ attrChecked: value, attrCheckedBox: value2 });
  }
  //设置属性状态
  setAttrChecked(): void {
    let attrCheckedBox = JSON.parse(JSON.stringify(this.state.attrCheckedBox));
    this.setState({ attrChecked: attrCheckedBox, choosePoints: [], centerPoint: {} });
  }
  //设置checkbox的状态
  setAttrCheckedBox(key: string, e: CheckboxChangeEvent): void {
    let attrCheckedBox = JSON.parse(JSON.stringify(this.state.attrCheckedBox));
    attrCheckedBox[key] = e.target.checked;
    // this.setState({ attrCheckedBox: attrCheckedBox });
    this.setState({ attrCheckedBox: attrCheckedBox,attrChecked: attrCheckedBox, choosePoints: [], centerPoint: {} });
  }
  setAttrDisplaySlider(e: ChangeEvent<HTMLSelectElement>): void {
    let value = e.target.value;
    if (value === 'Slider') {
      this.setState({ displaySlider: '0' });
    }
    else {
      this.setState({ displaySlider: '-100%' });
    }
  }
  setStrDisplaySlider(e: ChangeEvent<HTMLSelectElement>): void {
    let value = e.target.value;
    if (value === 'Slider') {
      this.setState({ displayDrawPanel: '0' });
    }
    else {
      this.setState({ displayDrawPanel: '-100%' });
    }
  }

  setAttrList(data:Array<string>):void{
    this.setState({attrList:data,attr_x:data[0],attr_y:data[1]});
  }
  setStrList(data:Array<string>):void{
    this.setState({strList:data,str_x:data[0],str_y:data[1]});
  }
  setAttrX(e:React.ChangeEvent<HTMLSelectElement>){
    this.setState({attr_x:e.target.value});
  }
  setAttrY(e:React.ChangeEvent<HTMLSelectElement>){
    this.setState({attr_y:e.target.value});
  }
  setStrX(e:React.ChangeEvent<HTMLSelectElement>){
    this.setState({str_x:e.target.value});
  }
  setStrY(e:React.ChangeEvent<HTMLSelectElement>){
    this.setState({str_y:e.target.value});
  }

  match():void{//匹配相似图
    const {dimensions,strWeight,attrWeight,attrChecked,attrValue,dataType,num}=this.state;
    const graph =this.state.personGraphs[0];
    const url='http://localhost:8080';
    let checkedArr:any=[];
    for(let key in attrChecked){
        checkedArr.push({name:key,value:attrChecked[key]})
    }
    axios.post(url+'/matchGraph',{wd:graph,dataType:dataType,num:num,dimensions:dimensions,strWeight:strWeight,attrWeight:attrWeight,attrChecked:checkedArr,attrValue:attrValue})
    .then(res=>{
        this.setChoosePoints(res.data.data);
    })
    axios.post(url+'/searchGraphByGraphId',{wd:graph.id,dataType:dataType,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr})
    .then(res=>{
        // console.log(res.data.data[0]);
        this.setCenterPoint(res.data.data[0]);
    })
    
}

  render(): React.ReactElement {
    const {dataType, strWeight_slider, attrWeight_slider, dimensions, strWeight, attrWeight, num, choosePoints,reTsneData,
      centerPoint, personGraphs, attr, attrSliderValue, attrValue, attrChecked, attrCheckedBox ,displaySlider,displayDrawPanel,
    attrList,strList,attr_x,attr_y,str_x,str_y} = this.state;
    let attrEl: Array<React.ReactElement> = [];
    for (let key in attr) {
      attrEl.push(
        <Row key={key} style={{ height: `calc(100% / ${attrList.length})` }}>
          <Col span={2}>
            <Checkbox checked={key in attrCheckedBox ? attrCheckedBox[key] : false} onChange={this.setAttrCheckedBox.bind(this, key)}></Checkbox>
          </Col>
          <Col span={4}>{key}:</Col>
          {/* <Col span={1}>{Math.floor(attr[key][0])}</Col> */}
          <Col span={10}>
            <Slider
              min={Math.floor(attr[key][0])}
              max={Math.floor(attr[key][1])}
              tipFormatter={null}
              step={1}
              range
              value={[Math.floor(attrSliderValue[key][0]), Math.floor(attrSliderValue[key][1])]}
              style={{ position: 'relative', top: '-4px' }}
              onChange={this.setOneAttrSliderValue.bind(this, key)}
              onAfterChange={this.setAttrValue.bind(this, key)}
            />
            {/* <span style={{ position: 'absolute', bottom: '-4px', left: 0, fontSize: '0.3rem' }}>{Math.floor(attr[key][0])}</span>
            <span style={{ position: 'absolute', bottom: '-4px', right: 0, fontSize: '0.3rem' }}>{Math.floor(attr[key][1])}</span> */}
          </Col>
          {/* <Col span={1}>{Math.floor(attr[key][1])}</Col> */}
          <Col span={2}></Col>
          <Col span={6}>
            <span>{Math.floor(attrSliderValue[key][0])}</span>
            <span>-</span>
            <span>{Math.floor(attrSliderValue[key][1])}</span>
          </Col>

        </Row>
      )
    }
    let attrSelect=attrList.map((value:string,index:number)=>
            <option value={value} key={index}>{value}</option>
        )
    let strSelect=strList.map((value:string,index:number)=>
        <option value={value} key={index}>{value}</option>
    )
    return (
      <div className="App">

        <div className="controlView">
          <div className="controlPanel">
            <div className="title">Control Panel</div>
            <div className="content" style={{textAlign:'left'}}>
              <Row style={{ height: '27px' }}>
              <Col span={7}>
                DataSet:
              </Col>
                <Col span={15}>
                <select style={{width:'100%',border:'1px solid #ccc'}} onChange={this.setDataType} value={dataType}> 
                  <option value="Author">Author</option>
                  <option value="Family">Family</option>
                </select>
                </Col>
              </Row>
              <Row style={{ height: '27px' }}>
                <Col span={7}>Dimensions:</Col>
                <Col span={10}>
                  <Slider
                    min={2}
                    max={1000}
                    value={128}
                    tipFormatter={null}
                    step={1}
                    style={{ position: 'relative', top: '-2px' }}
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
              <Row style={{ height: '27px' }}>
                <Col span={7}>Str-Weight:</Col>
                <Col span={10}>
                  <Slider
                    min={0}
                    max={1}
                    onChange={this.changeStrWeight}
                    value={typeof strWeight_slider === 'number' ? strWeight_slider : 0}
                    tipFormatter={null}
                    step={0.1}
                    style={{ position: 'relative', top: '-2px' }}
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
              <Row style={{ height: '27px' }}>
                <Col span={7}>Attr-Weight:</Col>
                <Col span={10}>
                  <Slider
                    min={0}
                    max={1}
                    onChange={this.changeAttrWeight}
                    value={typeof attrWeight_slider === 'number' ? attrWeight_slider : 0}
                    tipFormatter={null}
                    step={0.1}
                    style={{ position: 'relative', top: '-2px' }}
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
              <Row style={{ height: '27px' }}>
                <Col span={7}>Match count:</Col>
                <Col span={10}>
                  <Slider
                    min={1}
                    max={20}
                    onChange={this.changeNum}
                    value={typeof num === 'number' ? num : 0}
                    tipFormatter={null}
                    step={1}
                    style={{ position: 'relative', top: '-2px' }}
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
              <Row style={{ height: '27px' }}>
                <Col><Button onClick={this.changeWeight} style={{ margin: '0 5px' }} size='small'>search</Button></Col>
                <Col><Button onClick={this.match} style={{ margin: '0 5px' }} size='small'>match</Button></Col>
              </Row>
            </div>
          </div>
          <div className="filter">
            <div className="title">
              Attribute Panel
              <select style={{ float: "right", height: '100%' }} onChange={this.setAttrDisplaySlider} defaultValue="Slider">
                <option value="Slider">Slider</option>
                <option value="Graph">Scatter</option>
              </select>
              <select style={{float: "right", height: '100%'}} onChange={this.setAttrX} value={attr_x}>
                    {attrSelect}
                </select>
                <select style={{float: "right", height: '100%'}} onChange={this.setAttrY} value={attr_y}>
                    {attrSelect}
                </select>
              
            </div>
            <div className="content" style={{position:'relative' ,overflow:'hidden',textAlign:'left'}}>
              <DisTributeAttr key={'attrDisTributeAttr'} url='http://localhost:8080' dimensions={dimensions} attrWeight={attrWeight} strWeight={strWeight} attrChecked={attrChecked}
                choosePoints={choosePoints} centerPoint={centerPoint} display={displaySlider} dataType={dataType} graphType='attr' x={attr_x} y={attr_y}
                parent={{ setPersonGraphs: this.setPersonGraphs, setCenterPoint: this.setCenterPoint, setChoosePoints: this.setChoosePoints }}  />
              <div className="attrSliderBox" style={{position:'absolute',left:displaySlider,paddingLeft:'4px'}}>
                {attrEl}
                {/* <Row>
                  <Col><Button onClick={this.setAttrChecked} style={{ margin: '0 5px' }} size='small'>search</Button></Col>
                </Row> */}
              </div>
            </div>
          </div>
          <div className="drawPanel">
            <div className="title">Structure Panel
            <select style={{ float: "right", height: '100%' }} onChange={this.setStrDisplaySlider} defaultValue='Slider'>
                <option value="Slider">Paint</option>
                <option value="Graph">Scatter</option>
              </select>
            <select style={{float: "right", height: '100%'}} onChange={this.setStrX} value={str_x}>
                    {strSelect}
                </select>
                <select style={{float: "right", height: '100%'}} onChange={this.setStrY} value={str_y}>
                    {strSelect}
                </select>
            
            </div>
            <div className='content' style={{position:'relative' ,overflow:'hidden',textAlign:'left',padding:0}}>
            <DisTributeAttr key={'strDisTributeAttr'} url='http://localhost:8080' dimensions={dimensions} attrWeight={attrWeight} strWeight={strWeight} attrChecked={attrChecked}
                choosePoints={choosePoints} centerPoint={centerPoint} display={displayDrawPanel} dataType={dataType} graphType='str' x={str_x} y={str_y}
                parent={{ setPersonGraphs: this.setPersonGraphs, setCenterPoint: this.setCenterPoint, setChoosePoints: this.setChoosePoints }}  />

              <div style={{position:'absolute',left:displayDrawPanel,width:'100%',height:'100%'}}>
                <DrawPanel url='http://localhost:8080/matchModel' num={num} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
                attrChecked={attrChecked} attrValue={attrValue} dataType={dataType}
                parent={{ setChoosePoints: this.setChoosePoints,setCenterPoint:this.setCenterPoint,
                setReTsneData:this.setReTsneData}} />
              </div>
            
            </div>
          </div>

          {/* <div className='nodelistView'>
            <NodeList url="http://localhost:8080" parent={this.setPersonGraphs.bind(this)} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}/>
          </div> */}

        </div>

        <div className="right">
          <div className="infoView">
            <div className="title">Target View</div>
            <div className="content" style={{padding:0}}>
              <Info graphs={personGraphs} url='http://localhost:8080' num={num} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
                attrChecked={attrChecked} attrValue={attrValue} dataType={dataType}
                parent={{ setChoosePoints: this.setChoosePoints.bind(this), setCenterPoint: this.setCenterPoint.bind(this) }} />
            </div>
          </div>

          <div className="scatterView">
            <div className="title">Projection View</div>
            <div className="content">
              <ScatterPlot url="http://localhost:8080" choosePoints={choosePoints} centerPoint={centerPoint} reTsneData={reTsneData}
                dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight} attrChecked={attrChecked} attrValue={attrValue}
                dataType={dataType}
                parent={{ setChoosePoints: this.setChoosePoints.bind(this), setPersonGraphs: this.setPersonGraphs.bind(this) }} />
            </div>
          </div>

          <div className="forceComputeView">
            <div className='title'>Candidate View</div>
            <div className='content'>
              <ForceCompute graphs={choosePoints} dataType={dataType} />
            </div>
          </div>

          <div className="parallelView">
            <div className='title'>Parallel Coordinate</div>
            <div className='content'>
              <Parallel url="http://localhost:8080/getAttr" choosePoints={choosePoints} centerPoint={centerPoint}
                attrWeight={attrWeight} attrChecked={attrChecked} attrValue={attrValue} reTsneData={reTsneData} dataType={dataType}
                parent={{ setAttr: this.setAttr, initAttrChecked: this.initAttrChecked,setAttrList:this.setAttrList,setStrList:this.setStrList }} />
            </div>
          </div>
        </div>

      </div>
    );
  }

}

export default App;
