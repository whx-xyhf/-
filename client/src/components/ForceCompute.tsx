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
}

class ForceCompute extends React.Component<Props,any>{
    render():React.ReactElement{
        
        let graphElements=this.props.graphs.map((value:graph,index:number)=>
            <div className="forceBox" key={index}>
                    <NodeLink graph={value}/>
            </div>
        )
        return (
            <div className="forceCompute">
                {graphElements}
            </div>

        )
    }
}
export default ForceCompute;