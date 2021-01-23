import React from 'react';
import './App.css';
import ScatterPlot from './components/ScatterPlot';
import ForceCompute from './components/ForceCompute';
import NodeList from './components/NodeList';
import Info from './components/Info';
import Parallel from './components/Parallel';
import Table from './components/Table';
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
      dimensions:2,//向量维度
      num:20,//匹配的限制数量
    }
    this.setChoosePoints=this.setChoosePoints.bind(this);
    this.setPersonGraphs=this.setPersonGraphs.bind(this);
    this.setCenterPoint=this.setCenterPoint.bind(this);
    this.showNodeLink=this.showNodeLink.bind(this);
    this.showTable=this.showTable.bind(this);
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
  setNum(e:React.ChangeEvent<HTMLInputElement>):void{
    this.setState({num:e.target.value});
  }
  setDimensions(e:React.ChangeEvent<HTMLInputElement>):void{
    this.setState({dimensions:e.target.value,choosePoints:[],personGraphs:[],centerPoint:{}});
  }
  render():React.ReactElement{
    return (
      <div className="App">
        <div className="controlView">
          <div className='control'>
            维度：<input type="text" value={this.state.dimensions} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setDimensions(e)}/> <br></br>
            数量：<input type="text" value={this.state.num} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setNum(e)}/>
          </div>
          <div className='nodelistView'>
            <NodeList url="http://localhost:8080" parent={this.setPersonGraphs.bind(this)} dimensions={this.state.dimensions}/>
          </div>
        </div>
        <div className="infoView">
          <Info graphs={this.state.personGraphs} url='http://localhost:8080/matchGraph' num={this.state.num}  dimensions={this.state.dimensions}
          parent={{setChoosePoints:this.setChoosePoints.bind(this),setCenterPoint:this.setCenterPoint.bind(this)}}/>
        </div>
        <div className="scatterView">
          <ScatterPlot url="http://localhost:8080" choosePoints={this.state.choosePoints} centerPoint={this.state.centerPoint} dimensions={this.state.dimensions}
          parent={{setChoosePoints:this.setChoosePoints.bind(this),setPersonGraphs:this.setPersonGraphs.bind(this)}}/>
        </div>
        <div className="parallelView">
          <Parallel url="http://localhost:8080/getAttr" choosePoints={this.state.choosePoints} centerPoint={this.state.centerPoint}/>
        </div>
        <div className="forceComputeView">
          <div className='title'>
            <input type="button" value="nodeLink" onClick={this.showNodeLink}/>
            <input type="button" value="table" onClick={this.showTable}/>
          </div>
          <div className='content'>
            <ForceCompute graphs={this.state.choosePoints} display={this.state.nodeLinkDisplay}/>
            <Table display={this.state.tableDisplay} url="http://localhost:8080/compare" 
            num={this.state.num} graph={this.state.centerPoint}/>
          </div>
        </div>
      </div>
    );
  }
  
}

export default App;
