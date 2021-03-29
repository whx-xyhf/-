import * as React from 'react';
import axios from 'axios';
import { Input, Space } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

interface Props{
    url:string;
    parent:any,
    dimensions:number,
    strWeight:number,
    attrWeight:number,
    dataType:string,
    attrChecked: any,
}

class NodeList extends React.Component<Props,any>{
    constructor(props:Props){
        super(props)
        this.state={wd:'',searchValue:{}}
        this.change=this.change.bind(this);
        this.search=this.search.bind(this);
        this.searchGraph=this.searchGraph.bind(this);
    }
    //input双向绑定
    change(e:React.ChangeEvent<HTMLInputElement>):void{
        this.setState({
            wd:e.target.value
        })
    }
    //搜索
    search():void{//根据搜索框的字段搜索作者
        axios.post(this.props.url+'/searchPerson',{wd:this.state.wd,dataType:this.props.dataType})
        .then(res=>{
            this.setState({searchValue:res.data.data});
        })
    }
    searchGraph(e:any):void{//根据名字搜索包含该节点的网络
        const {url,dimensions,attrWeight,strWeight,attrChecked,dataType}=this.props;
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]})
        }
        axios.post(url+'/searchGraphByPersonId',{wd:e.target.dataset['num'],dimensions:dimensions,strWeight:strWeight,attrWeight:attrWeight,attrChecked:checkedArr,dataType:dataType})
        .then(res=>{
            // console.log(res.data.data);
            this.props.parent(res.data.data);
        })
    }
    componentDidMount():void{
        this.search();
    }
    render():React.ReactElement{
        const { Search } = Input;
        const suffix = (
            <AudioOutlined
              style={{
                fontSize: 16,
                color: '#1890ff',
              }}
            />
          );

        let liList:Array<React.ReactElement>=[];
        for(let wd in this.state.searchValue){
            liList.push(
                <li data-num={this.state.searchValue[wd]} key={this.state.searchValue[wd]} onClick={this.searchGraph}>{wd}</li>
            )
        }
        return (
            <div className="searchView">
                {/* <input type="text" value={this.state.wd} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.change(e)}></input>
                <input type="button" value="search" onClick={this.search}></input> */}
                <div className="search">
                    <Space direction="vertical">
                        <Search value={this.state.wd} placeholder="input search author" onSearch={this.search} style={{ width: 200 }} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.change(e)}/>
                    </Space>
                </div>
                

                <div className="nodeList">{liList}</div>
               
            </div>
        )
    }
}
export default NodeList