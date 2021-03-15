import * as React from 'react';
import axios from 'axios';
import NodeLink from './NodeLink';
import TargetTree from './TargetTree';

interface Props{
    display:boolean;
    url:string;
    parent: any,
    dimensions: number,
    attrChecked: attr,
    dataType: string,
    changePage:any,
}
type attr = {
    [propName: string]: any,
}

class HistoryRecord extends React.Component<Props, any>{
    constructor(props:Props){
        super(props);
        this.state={record:[]};
        this.getHistoryRecord=this.getHistoryRecord.bind(this);
        this.selectCondidate=this.selectCondidate.bind(this);
    }

    getHistoryRecord(url:string,dimensions:number,attrChecked:attr,dataType:string):void{
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]})
        }
        axios.post(url,{dimensions:dimensions,attrChecked:checkedArr,dataType:dataType})
        .then(res=>{
            if(res.data.data!==this.state.record)
                this.setState({record:res.data.data});
        })
    }

    selectCondidate(graph:any){
        this.props.parent.setPersonGraphs([graph]);
        this.props.changePage(0);
    }

    componentWillReceiveProps(nextProps:Props){
        const {display,dimensions,attrChecked,dataType}=this.props;
        if(nextProps.display===true && nextProps.display!==display){
            this.getHistoryRecord(nextProps.url,nextProps.dimensions,nextProps.attrChecked,nextProps.dataType);
        }
        else if(nextProps.display===true && nextProps.display===display){
            if(nextProps.dimensions!==dimensions || nextProps.dataType!==dataType || nextProps.attrChecked!==attrChecked){
                this.getHistoryRecord(nextProps.url,nextProps.dimensions,nextProps.attrChecked,nextProps.dataType);
            }
        }
    }

    render():React.ReactElement{

        const {record}=this.state;
        const {dataType,parent}=this.props;
        let el=record.map((value:any,index:number)=>{
            if(dataType==='Author')
                return (
                    <div className="forceBox" key={index}>
                    <div className="condidateBox" >
                        <div className="candidateTitle">
                            Graph:{value.graph.id}<br/>
                            Date:{value.date.split(' ')[0]}
                        </div>
                        <div className="candidateContent">
                            <NodeLink graph={value.graph} onClick={this.selectCondidate} parent={parent}/>
                        </div>
                    </div>
                    </div>
                )
            else if(dataType==='Family')
                return (
                    <div className="forceBox" key={index}>
                    <div className="condidateBox">
                        <div className="candidateTitle">
                            Graph:{value.graph.id}<br/>
                            Date:{value.date.split(' ')[0]}
                        </div>
                        <div className="candidateContent">
                            <TargetTree graph={value.graph} onClick={this.selectCondidate} parent={parent}/>
                        </div>

                    </div>
                    </div>
                )
        })

        return (
            <div style={{width:'100%',height:'100%'}}>
                {el}
            </div>
        )
    }
}

export default HistoryRecord;