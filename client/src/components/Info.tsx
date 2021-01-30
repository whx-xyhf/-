import * as React from 'react';
import NodeLink from './NodeLink';
import axios from 'axios';


type edges=Array<number>;
type graph={
    id:number,
    nodes:Array<number>,
    edges:Array<edges>,
    [propName:string]:any,
}

interface Props{
    graphs:Array<graph>,
    url:string,
    num:number,//匹配数量
    parent:any,
    dimensions:number,
    strWeight:number,
    attrWeight:number,
}

class Info extends React.Component<Props,any>{
    constructor(props:Props){
        super(props);
        this.match=this.match.bind(this);
    }
    match(graph:graph):void{//匹配相似图
        const {url,dimensions,strWeight,attrWeight}=this.props;
        axios.post(url+'/matchGraph',{wd:graph,num:this.props.num,dimensions:dimensions,strWeight:strWeight,attrWeight:attrWeight})
        .then(res=>{
            this.props.parent.setChoosePoints(res.data.data);
        })
        axios.post(url+'/searchGraphByGraphId',{wd:graph.id,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight})
        .then(res=>{
            console.log(res.data.data[0]);
            this.props.parent.setCenterPoint(res.data.data[0]);
        })
        
    }
    render():React.ReactElement{
        let elements=this.props.graphs.map((graph:graph,index:number)=>{

        // console.log(graph)
        let names:Array<React.ReactElement>=[];
            for(let i in graph.names){
                names.push(
                    <p key={i}>{graph.names[i]}</p>
                )
            }
            return(
                <div className='infoBox' key={index}>
                    <input type="button" value="match" onClick={this.match.bind(this,graph)}></input>
                    <div style={{height:'100%',width:'calc(100% - 100px)',float:'left'}}>
                        <NodeLink graph={graph} key={index}/>
                    </div>
                    <div className="infoName" style={{height:'100%',width:'100px',fontSize:'0.5rem',float:'left',overflowX:'hidden',overflowY:'auto'}}>
                        {names}
                    </div>
                </div>
            )
        })
        return (
            <div className='info'>
                    {elements}
            </div>
        )
        //,wordWrap:'break-word',wordBreak:'normal'
    }
}

export default Info;