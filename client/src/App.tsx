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
import axios from './components/http';


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
      dataType: 'Author',//数据集名称
      // dataType:'Family',//数据集名称
      // dataType:'Weibo',
      reTsneData: [],//重新降维的数据
      choosePoints: [],//圈选的点
      personGraphs: [],//选中的人所在的子图
      centerPoint: {},//点击的点
      dimensions: 128,//向量维度
      num: 20,//匹配的限制数量
      strWeight: 1,//拓扑权重
      attrWeight: 1,//属性权重
      strWeight_slider: 1,//拓扑权重(保存滑块的值)
      attrWeight_slider: 1,//属性权重(保存滑块的值)
      attr: {},//属性及对应的最大范围
      attrSliderValue: {},//属性slider选择的范围
      attrValue: {},//确认时属性的范围
      attrChecked: {},//属性checkbox状态
      attrCheckedBox: {},//临时保存checkbox的值
      attrList: [],//所有属性字段
      strList: [],//所有结构字段

      displaySlider: '0',//显示属性调节滑块
      displayDrawPanel: '0',//显示画板

      attr_x: '',
      attr_y: '',
      str_x: '',
      str_y: '',

      showClusterPanel:'none',
    }
    this.setDataType = this.setDataType.bind(this);
    this.setReTsneData = this.setReTsneData.bind(this);
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
    this.setAttrList = this.setAttrList.bind(this);
    this.setStrList = this.setStrList.bind(this);
    this.setStrX = this.setStrX.bind(this);
    this.setStrY = this.setStrY.bind(this);
    this.setAttrX = this.setAttrX.bind(this);
    this.setAttrY = this.setAttrY.bind(this);
    this.match = this.match.bind(this);
    this.setShowClusterPanel=this.setShowClusterPanel.bind(this);
    this.reset=this.reset.bind(this);
    this.addPersonGraph=this.addPersonGraph.bind(this);
  }
  setDataType(e: ChangeEvent<HTMLSelectElement>): void {
    let value = e.target.value;

    this.setState({ dataType: value, choosePoints: [], centerPoint: {}, personGraphs: [] });
  }
  setReTsneData(data: ChoosePointData): void {
    this.setState({ reTsneData: JSON.parse(JSON.stringify(data)) });
  }
  setChoosePoints(data: ChoosePointData): void {
    this.setState({ choosePoints: data });
  }
  setPersonGraphs(data: ChoosePointData): void {
    this.setState({ personGraphs: data });
  }
  addPersonGraph(data:any):void{
    const {personGraphs}=this.state;
    personGraphs.splice(0,0,data);
    this.setState({personGraphs:personGraphs})
  }
  setCenterPoint(data: ChoosePointData): void {
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
  changeStrWeight(e: CheckboxChangeEvent): void {
    if (e.target.checked === true)
      this.setState({ strWeight_slider: 1 });
    else
      this.setState({ strWeight_slider: 0 });
  }
  //设置属性权重滑块
  changeAttrWeight(e: CheckboxChangeEvent): void {
    if (e.target.checked === true)
      this.setState({ attrWeight_slider: 1 });
    else
      this.setState({ attrWeight_slider: 0 });
  }
  changeNum(value: string | number | null | undefined): void {
    this.setState({ num: value });
  }
  //确认权重
  changeWeight(): void {
    const { strWeight_slider, attrWeight_slider, attrCheckedBox } = this.state;
    this.setState({ strWeight: strWeight_slider, attrWeight: attrWeight_slider, attrChecked: JSON.parse(JSON.stringify(attrCheckedBox)), choosePoints: [], centerPoint: {},reTsneData:[] });
  }
  //设置属性类型
  setAttr(value: attr): void {
    let value2 = JSON.parse(JSON.stringify(value));
    let value3 = JSON.parse(JSON.stringify(value));
    this.setState({ attr: value, attrSliderValue: value2, attrValue: value3 });
  }
  setOneAttrSliderValue(key: string, value: any): void {
    let attrSliderValue = this.state.attrSliderValue;
    attrSliderValue[key] = value;
    this.setState({ attrSliderValue: JSON.parse(JSON.stringify(attrSliderValue)) });
  }
  //设置属性范围
  setAttrValue(key: string, value: any): void {
    let attrValue = this.state.attrValue;
    attrValue[key] = value;
    this.setState({ attrValue: JSON.parse(JSON.stringify(attrValue)) });
  }
  //
  setAttrValueMin(key: string, value: any): void {
    // let attrValue = this.state.attrValue;
    // attrValue[key][0] = value;
    let attrSliderValue = this.state.attrSliderValue;
    attrSliderValue[key][0] = value;
    this.setState({ attrSliderValue: JSON.parse(JSON.stringify(attrSliderValue)) });
  }
  setAttrValueMax(key: string, value: any): void {
    // let attrValue = this.state.attrValue;
    // attrValue[key][1] = value;
    let attrSliderValue = this.state.attrSliderValue;
    attrSliderValue[key][1] = value;
    this.setState({ attrSliderValue: JSON.parse(JSON.stringify(attrSliderValue)) });
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
    this.setState({ attrCheckedBox: attrCheckedBox, choosePoints: [], centerPoint: {} });
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

  setAttrList(data: Array<string>): void {
    this.setState({ attrList: data, attr_x: data[0], attr_y: data[1] });
  }
  setStrList(data: Array<string>): void {
    this.setState({ strList: data, str_x: data[0], str_y: data[1] });
  }
  setAttrX(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ attr_x: e.target.value });
  }
  setAttrY(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ attr_y: e.target.value });
  }
  setStrX(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ str_x: e.target.value });
  }
  setStrY(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ str_y: e.target.value });
  }
  setShowClusterPanel(value:string){
    this.setState({showClusterPanel:value})
  }
  reset(){
    this.setState({choosePoints: [], centerPoint: {},personGraphs:[]});
  }

  match(): void {//匹配相似图
    const { dimensions, strWeight, attrWeight, attrChecked, attrValue, attrSliderValue, dataType, num } = this.state;
    let index=0;
    console.log(this.state.personGraphs)
    if(this.state.personGraphs.length>1){
      const div=document.getElementById('target0');
      let totalH =div?.scrollHeight || 0;
      let clientH=div?.clientHeight || 0;
      index=Math.floor((div?.scrollTop||0)/(totalH-clientH)*this.state.personGraphs.length);
    }
    
    const graph = this.state.personGraphs[index];
    const url = 'http://localhost:8080';
    if (attrValue !== attrSliderValue)
      this.setState({ attrValue: JSON.parse(JSON.stringify(attrSliderValue)) })

    let checkedArr: any = [];
    for (let key in attrChecked) {
      checkedArr.push({ name: key, value: attrChecked[key] })
    }
    axios.post(url + '/matchGraph', { wd: graph, dataType: dataType, num: num, dimensions: dimensions, strWeight: strWeight, attrWeight: attrWeight, attrChecked: checkedArr, attrValue: attrSliderValue })
      .then(res => {
        this.setChoosePoints(res.data.data);
      })
    axios.post(url + '/searchGraphByGraphId', { wd: graph.id, dataType: dataType, dimensions: dimensions, attrWeight: attrWeight, strWeight: strWeight, attrChecked: checkedArr })
      .then(res => {
        // console.log(res.data.data[0]);
        this.setCenterPoint(res.data.data[0]);
      })

  }

  render(): React.ReactElement {
    const { dataType, dimensions, strWeight, attrWeight, num, choosePoints, reTsneData, strWeight_slider, attrWeight_slider,
      centerPoint, personGraphs, attr, attrSliderValue, attrValue, attrChecked, attrCheckedBox, displaySlider, displayDrawPanel,
      attrList, strList, attr_x, attr_y, str_x, str_y,showClusterPanel} = this.state;
    let attrEl: Array<React.ReactElement> = [];
    for (let key in attr) {
      attrEl.push(
        <Row key={key} style={{ height: `calc(98% / ${attrList.length})` }}>
          <Col span={2}>
            <Checkbox checked={key in attrCheckedBox ? attrCheckedBox[key] : false} onChange={this.setAttrCheckedBox.bind(this, key)}></Checkbox>
          </Col>
          <Col span={3}>{key}:</Col>
          {/* <Col span={1}>{Math.floor(attr[key][0])}</Col> */}
          <Col span={8}>
            <Slider
              min={Math.floor(attr[key][0])}
              max={Math.floor(attr[key][1])}
              tipFormatter={null}
              step={1}
              range
              value={[Math.floor(attrSliderValue[key][0]), Math.floor(attrSliderValue[key][1])]}
              style={{ position: 'relative', top: '-4px' }}
              onChange={this.setOneAttrSliderValue.bind(this, key)}
              onAfterChange={this.setOneAttrSliderValue.bind(this, key)}
            />
            {/* <span style={{ position: 'absolute', bottom: '-4px', left: 0, fontSize: '0.3rem' }}>{Math.floor(attr[key][0])}</span>
            <span style={{ position: 'absolute', bottom: '-4px', right: 0, fontSize: '0.3rem' }}>{Math.floor(attr[key][1])}</span> */}
          </Col>
          {/* <Col span={1}>{Math.floor(attr[key][1])}</Col> */}
          {/* <Col span={2}></Col>
          <Col span={6}>
            <span>{Math.floor(attrSliderValue[key][0])}</span>
            <span>-</span>
            <span>{Math.floor(attrSliderValue[key][1])}</span>
            
          </Col> */}
          <Col span={4}>
            <InputNumber
              min={Math.floor(attr[key][0])}
              max={Math.floor(attr[key][1])}
              size='small'
              style={{ margin: '0 16px', width: '100%' }}
              value={Math.floor(attrSliderValue[key][0])}
              onChange={this.setAttrValueMin.bind(this, key)}
            />
          </Col>
          <Col span={1} style={{ textAlign: 'center', margin: '0 0 0 16px' }}>-</Col>
          <Col span={4}>
            <InputNumber
              min={Math.floor(attr[key][0])}
              max={Math.floor(attr[key][1])}
              size='small'
              style={{ width: '100%' }}
              value={Math.floor(attrSliderValue[key][1])}
              onChange={this.setAttrValueMax.bind(this, key)}
            />
          </Col>

        </Row>
      )
    }
    let attrSelect = attrList.map((value: string, index: number) =>
      <option value={value} key={index}>{value}</option>
    )
    let strSelect = strList.map((value: string, index: number) =>
      <option value={value} key={index}>{value}</option>
    )
    return (
      <div className="App">

        <div className="controlView">
          <div className="controlPanel">
            <div className="title controlTitle">Control Panel</div>
            <div className="content" style={{ textAlign: 'left' ,overflow:'hidden'}}>
              <Row style={{ height: '27px' }}>
                <Col span={7}>
                  DataSet:
              </Col>
                <Col span={15}>
                  <select style={{ width: '100%', border: '1px solid #ccc' }} onChange={this.setDataType} value={dataType}>
                    <option value="Author">Co-author</option>
                    <option value="Family">Genealogy</option>
                    <option value="Weibo">micro-blog retweeting</option>
                  </select>
                </Col>
              </Row>
              <Row style={{ height: '30px' }}>
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
              {/* <Row style={{ height: '27px' }}>
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
              </Row> */}
              <Row style={{ height: '30px' }}>
                <Col span={7}>Match count:</Col>
                <Col span={10}>
                  <Slider
                    min={1}
                    max={50}
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
                    max={50}
                    size='small'
                    style={{ margin: '0 16px', width: '100%' }}
                    value={num}
                    onChange={this.changeNum}
                  />
                </Col>
              </Row>
              {/* <Row style={{ height: '30px' }}>
                <Col span={2}>Eps:</Col>
                <Col span={5}>
                  <InputNumber
                    min={1}
                    max={20}
                    size='small'
                    style={{ margin: '0 5px', width: '100%' }}
                    value={eps_input}
                    onChange={this.setEpsInput}
                  />
                </Col>
                <Col span={1}></Col>
                <Col span={2}>MS:</Col>
                <Col span={5}>
                  <InputNumber
                    min={1}
                    max={20}
                    size='small'
                    style={{ margin: '0 5px', width: '100%' }}
                    value={minSamples_input}
                    onChange={this.setMinSamplesInput}
                  />
                </Col>
                <Col span={1}></Col>
                <Col span={6}><Button style={{ margin: '0 2px',width:'100%' }} size='small' onClick={this.setDBSCAN}>DBSCAN</Button></Col>
              </Row> */}
              <Row style={{ height: '27px' }}>
                <Col span={2}>
                  <Checkbox checked={strWeight_slider === 1 ? true : false} onChange={this.changeStrWeight}></Checkbox>
                </Col>
                <Col span={2} style={{ margin: '0 0 0 -2px' }}>Str</Col>
                <Col span={2}>
                  <Checkbox checked={attrWeight_slider === 1 ? true : false} onChange={this.changeAttrWeight}></Checkbox>
                </Col>
                <Col span={2} style={{ margin: '0 0 0 -2px' }}>Attr</Col>
                <Col><Button onClick={this.changeWeight} style={{ margin: '0 5px' }} size='small'>Project</Button></Col>
                <Col><Button onClick={this.match} style={{ margin: '0 5px' }} size='small'>Match</Button></Col>
                <Col><Button style={{ margin: '0 5px' }} size='small' onClick={this.reset}>Reset</Button></Col>
              </Row>
            </div>
          </div>
          <div className="filter">
            <div className="title controlTitle">
              Attribute Panel
              <select style={{ float: "right", height: '100%' }} onChange={this.setAttrDisplaySlider} defaultValue="Slider">
                <option value="Slider">Slider</option>
                <option value="Graph">Scatter</option>
              </select>
              <select style={{ float: "right", height: '100%' }} onChange={this.setAttrX} value={attr_x}>
                {attrSelect}
              </select>
              <select style={{ float: "right", height: '100%' }} onChange={this.setAttrY} value={attr_y}>
                {attrSelect}
              </select>

            </div>
            <div className="content" style={{ position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
              <DisTributeAttr key={'attrDisTributeAttr'} url='http://localhost:8080' dimensions={dimensions} attrWeight={attrWeight} strWeight={strWeight} attrChecked={attrChecked}
                choosePoints={choosePoints} centerPoint={centerPoint} display={displaySlider} dataType={dataType} graphType='attr' x={attr_x} y={attr_y} personGraphs={personGraphs}
                parent={{ setPersonGraphs: this.setPersonGraphs, setCenterPoint: this.setCenterPoint, setChoosePoints: this.setChoosePoints }} />
              <div className="attrSliderBox" style={{ position: 'absolute', left: displaySlider, paddingLeft: '4px' }}>
                {attrEl}
                {/* <Row>
                  <Col><Button onClick={this.setAttrChecked} style={{ margin: '0 5px' }} size='small'>search</Button></Col>
                </Row> */}
              </div>
            </div>
          </div>
          <div className="drawPanel">
            <div className='title controlTitle'>Structure Panel
            <select style={{ float: "right", height: '100%' }} onChange={this.setStrDisplaySlider} defaultValue='Slider'>
                <option value="Slider">Paint</option>
                <option value="Graph">Scatter</option>
              </select>
              <select style={{ float: "right", height: '100%' }} onChange={this.setStrX} value={str_x}>
                {strSelect}
              </select>
              <select style={{ float: "right", height: '100%' }} onChange={this.setStrY} value={str_y}>
                {strSelect}
              </select>

            </div>
            <div className='content' style={{ position: 'relative', overflow: 'hidden', textAlign: 'left', padding: 0 }}>
              <DisTributeAttr key={'strDisTributeAttr'} url='http://localhost:8080' dimensions={dimensions} attrWeight={attrWeight} strWeight={strWeight} attrChecked={attrChecked}
                choosePoints={choosePoints} centerPoint={centerPoint} display={displayDrawPanel} dataType={dataType} graphType='str' x={str_x} y={str_y} personGraphs={personGraphs}
                parent={{ setPersonGraphs: this.setPersonGraphs, setCenterPoint: this.setCenterPoint, setChoosePoints: this.setChoosePoints }} />

              <div style={{ position: 'absolute', left: displayDrawPanel, width: '100%', height: '100%' }}>
                <DrawPanel url='http://localhost:8080/matchModel' num={num} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
                  attrChecked={attrChecked} attrValue={attrValue} dataType={dataType} attrSliderValue={attrSliderValue}
                  parent={{
                    setChoosePoints: this.setChoosePoints, setCenterPoint: this.setCenterPoint,
                    setReTsneData: this.setReTsneData,setAttrValue:(value:any)=>this.setState({ attrValue: value})
                  }} />
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
            <div className="content" style={{ padding: 0 }}>
              <Info graphs={personGraphs} url='http://localhost:8080' num={num} dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight}
                attrChecked={attrChecked} attrValue={attrValue} dataType={dataType}
                parent={this} />
            </div>
          </div>

          <div className="scatterView">
            <div className="title">Projection View
              <div className="showCluster" onClick={this.setShowClusterPanel.bind(this,'block')}></div>
            </div>
            <div className="content">
              <ScatterPlot url="http://localhost:8080" choosePoints={choosePoints} centerPoint={centerPoint} reTsneData={reTsneData}
                dimensions={dimensions} strWeight={strWeight} attrWeight={attrWeight} attrChecked={attrChecked} attrValue={attrValue}
                dataType={dataType} showClusterPanel={showClusterPanel} personGraphs={personGraphs}
                parent={{
                  setChoosePoints: this.setChoosePoints.bind(this), setPersonGraphs: this.setPersonGraphs.bind(this),addPersonGraph:this.addPersonGraph.bind(this)
                  ,setShowClusterPanel:this.setShowClusterPanel.bind(this)
                }} />
            </div>
          </div>

          <div className="forceComputeView">
            <div className='title'>Candidate View</div>
            <div className='content'>
              <ForceCompute graphs={choosePoints} dataType={dataType} parent={this} personGraphs={personGraphs}/>
            </div>
          </div>

          <div className="parallelView">
            <div className='title'>Parallel Coordinate</div>
            <div className='content'>
              <Parallel url="http://localhost:8080" choosePoints={choosePoints} centerPoint={centerPoint} personGraphs={personGraphs}
                attrWeight={attrWeight} attrChecked={attrChecked} attrValue={attrValue} reTsneData={reTsneData} dataType={dataType}
                parent={{ setAttr: this.setAttr, initAttrChecked: this.initAttrChecked,setAttrList:this.setAttrList,setStrList:this.setStrList }} />
            </div>
          </div>

        
          

        </div>
        <div className="clusterBackGround" style={{display:showClusterPanel}}>

        </div>

      </div>
    );
  }

}

export default App;
