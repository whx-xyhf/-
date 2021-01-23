import * as React from 'react';
import NodeLink from './NodeLink';

//定义边数组
type edges=Array<number>;
type graph={
    id:number,
    nodes:Array<number>,
    edges:Array<edges>,
    [propName:string]:any,
}

interface Props{
    graphs:Array<graph>,
    display:string,
}

class ForceCompute extends React.Component<Props,any>{
    
    render():React.ReactElement{
        
        let graphElements=null;
        if(this.props.display==='block'){
            graphElements=this.props.graphs.map((value:graph,index:number)=>
                <div className="forceBox" key={index}>
                        <NodeLink graph={value}/>
                </div>
            )
        }
        return (
            <div className="forceCompute" style={{display:this.props.display}}>
                {graphElements}
            </div>

        )
    }
}
export default ForceCompute;