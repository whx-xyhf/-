import * as React from 'react';
import axios from 'axios';

type ChoosePointData ={
    id: number,
    nodes: Array<number>,
    edges:Array<edges>,
    [propName:string]:any,
  }
type edges=Array<number>;

interface Props{
    display:string,
    url:string,
    num:number,
    graph:ChoosePointData,
}

class Table extends React.Component<Props,any>{
    constructor(props:Props){
        super(props);
        this.state={data:{}};
        this.getData=this.getData.bind(this);
    }
    getData(graph:ChoosePointData):void{
        if(graph.id){
            axios.post(this.props.url,{graph:graph,num:this.props.num})
            .then(res=>{
                this.setState({data:res.data.data});
            })
        }
    }
    componentDidMount():void{
        this.getData(this.props.graph);
    }
    componentWillReceiveProps(nextProps:Props):void{
        if(nextProps.graph!==this.props.graph){
            this.getData(nextProps.graph);
        }
        if(nextProps.graph===this.props.graph && nextProps.num!=this.props.num){
            this.getData(nextProps.graph);
        }
        if(this.props.display!==nextProps.display && nextProps.display==='block'){
            if(this.props.graph!==nextProps.graph){
                this.getData(nextProps.graph);
            }
        }
    }
    render():React.ReactElement{
        let ged=this.state.data.ged;
        let attr=this.state.data.attr;
        let colName=[];
        let rowName=[];
        let rowValues=[];
        for(let col in attr){
            for(let type in attr[col]){
                for(let key in attr[col][type]){
                    let row=key+'_'+type;
                    rowName.push(row);
                }
            }
            break;
        }
        for(let col in ged){
            colName.push(col);
        }
        for(let col in ged){
            for(let type in attr[col]){
                let row='ged_'+type;
                rowName.push(row);
            }
            break;
        }
        for(let row in rowName){
            let rowValue=[];
            for(let col in attr){
                for(let type in attr[col]){
                    if (rowName[row].indexOf(type)>=0){
                        for(let key in attr[col][type]){
                            if(rowName[row].indexOf(key)>=0){
                                rowValue.push(attr[col][type][key]);
                            }
                        }
                    }
                    
                }
            }
            if(rowValue.length>0)
                rowValues.push(rowValue);
        }
        for(let row in rowName){
            let rowValue=[];
            for(let col in ged){
                for(let type in ged[col]){
                    if (rowName[row].indexOf(type)>=0 && rowName[row].indexOf('ged')>=0){
                        rowValue.push(ged[col][type]);
                    }
                    
                }
            }
            if(rowValue.length>0)
                rowValues.push(rowValue);
        }
        
        let tr=[];
        let th=[<th key={'th'+1}></th>];
        for(let i=0;i<colName.length;i++){
            th.push(<th key={i}>{colName[i]}维</th>)
        }
        tr.push(<tr key={-1}>{th}</tr>)
        for(let i=0;i<rowValues.length;i++){
            let td=[];
            td.push(<td key={'rowName'+i}>{rowName[i]}</td>)
            for(let j=0;j<rowValues[i].length;j++){
                td.push(
                    <td key={j+i}>{rowValues[i][j].toFixed(2)}</td>
                )
            }
            tr.push(
                <tr key={'tr'+i}>{td}</tr>
            )
        }
        return(
            <div className='table' style={{display:this.props.display}}>
                <table style={{border:1}}>
                    <tbody>{tr}</tbody>
                </table>
            </div>
        )
        
    }
}
export default Table;