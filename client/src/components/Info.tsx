import * as React from 'react';
// import NodeLink from './NodeLink';
import PNodeLink from './PNodeLink';
import PTargetTree from './PTargetTree';
import HistoryRecord from './HistoryRecord';
import axios from 'axios';
import graphURL from '../assets/graph.png';
import graphSelectURL from '../assets/graph_select.png';
import tableURL from '../assets/table.png';
import tableSelectURL from '../assets/table_select.png';
import historyURl from '../assets/history.png';
import historySelectURL from '../assets/history_select.png';


type edges = Array<number>;
type graph = {
    id: number,
    // nodes:Array<number>,
    // edges:Array<edges>,
    [propName: string]: any,
}

interface Props {
    graphs: Array<graph>,
    url: string,
    num: number,//匹配数量
    parent: any,
    dimensions: number,
    strWeight: number,
    attrWeight: number,
    attrChecked: attr,
    attrValue: attr,
    dataType: string,
}
type attr = {
    [propName: string]: any,
}

class Info extends React.Component<Props, any>{
    private icons: Array<string> = [graphURL, tableURL, historyURl];
    private selectIcos: Array<string> = [graphSelectURL, tableSelectURL, historySelectURL];
    constructor(props: Props) {
        super(props);
        this.state = { selectNum: 0 }
        this.match = this.match.bind(this);
        this.changePage=this.changePage.bind(this);
    }
    match(graph: graph): void {//匹配相似图
        const { url, dimensions, strWeight, attrWeight, attrChecked, attrValue, dataType } = this.props;
        let checkedArr: any = [];
        for (let key in attrChecked) {
            checkedArr.push({ name: key, value: attrChecked[key] })
        }
        axios.post(url + '/matchGraph', { wd: graph, dataType: dataType, num: this.props.num, dimensions: dimensions, strWeight: strWeight, attrWeight: attrWeight, attrChecked: checkedArr, attrValue: attrValue })
            .then(res => {
                this.props.parent.setChoosePoints(res.data.data);
            })
        axios.post(url + '/searchGraphByGraphId', { wd: graph.id, dataType: dataType, dimensions: dimensions, attrWeight: attrWeight, strWeight: strWeight, attrChecked: checkedArr })
            .then(res => {
                // console.log(res.data.data[0]);
                this.props.parent.setCenterPoint(res.data.data[0]);
            })

    }
    changePage(number:number):void{
        this.setState({selectNum:number});
    }
    render(): React.ReactElement {
        const {dimensions,attrChecked,dataType,url,parent}=this.props;
        let components:any=[];
        let elements = this.props.graphs.map((graph: graph, index: number) => {
            let el = null;
            if (this.props.dataType === "Author") {
                el = <PNodeLink graph={graph} key={index} />;
            }
            else if (this.props.dataType === "Family") {
                el = <PTargetTree graph={graph} key={index} />
            }
            return (
                <div className='infoBox' key={index} style={{ width: "100%",height:'100%',float:'left' }}>

                    <div style={{ height: '100%', width: '100%', float: 'left' }}>
                        {el}
                    </div>

                </div>
            )
        })
        components.push(elements) 
        components.push(<p>table</p>)
        components.push(<HistoryRecord parent={parent} changePage={this.changePage} url={url+'/readHistoryRecord'} display={this.state.selectNum===2?true:false} dimensions={dimensions} attrChecked={attrChecked} dataType={dataType}/>)
        let iconsEl = this.icons.map((value: string, index: number) => {
            return (
                <div style={{ width: '100%', height: '60px', borderBottom:'1px solid #ccc',borderRight:'1px solid #ccc',cursor:'pointer'}} key={index} >
                    <img src={this.state.selectNum === index ? this.selectIcos[index] : value} width="100%" height="100%" onClick={this.changePage.bind(this,index)} />
                </div>
            )
        })

        let pageEl=this.icons.map((value:string,index:number)=>{
            let translate=`translate(0,-${this.state.selectNum*100}%)`;
            return(
                <div key={index} style={{ width: "100%" ,height:'100%',transform:translate,display:'inline-block',float:'left'}}>
                    {components[index]}
                </div>
            )
        })
        return (
            <div className='info'>
                {/* <input type="button" value="match" onClick={this.match.bind(this,graph)}></input> */}
                {/* <div className="infoName" style={{
                    height: '100%', width: '50px', fontSize: '0.5rem', float: 'left',
                    overflowX: 'hidden', overflowY: 'auto', backgroundColor: 'rgb(254,254,254)', border: '1px solid #ccc',
                    borderTop: 'none', boxSizing: 'border-box'
                }}>
                    {iconsEl}
                </div> */}
                
                <div style={{width: "100%" ,height:'100%',float:"left"}}>
                    {pageEl}
                </div>
                <div style={{position:'absolute',top:'0',right:'0',width:'50px',height:'auto'}}>
                    {iconsEl}
                </div>
            </div>
        )
        //,wordWrap:'break-word',wordBreak:'normal'
    }
}

export default Info;