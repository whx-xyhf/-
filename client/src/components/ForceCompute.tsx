import * as React from 'react';
import NodeLink from './NodeLink';
import TargetTree from './TargetTree';

//定义边数组
type edges = Array<number>;
type graph = {
    id: number,
    // nodes:Array<number>,
    // edges:Array<edges>,
    [propName: string]: any,
}

interface Props {
    graphs: Array<graph>,
    dataType: string,
    parent:any;
}

class ForceCompute extends React.Component<Props, any>{

    constructor(props:Props){
        super(props)
        this.state={selectIndex:-1,selectBorder:'red'};
        this.selectCondidate=this.selectCondidate.bind(this);
    }

    selectCondidate(graph:graph){
        this.props.parent.setPersonGraphs([graph]);
    }
    selectIndex(index:number){
        this.setState({selectIndex:index});
    }

    render(): React.ReactElement {

        let graphElements = null;
        const { dataType ,parent} = this.props;
        const {selectIndex,selectBorder}=this.state;
        if (dataType === 'Author') {
            graphElements = this.props.graphs.map((value: graph, index: number) =>
                <div className="forceBox" key={index} onClick={this.selectIndex.bind(this,index)}>
                    <div className="condidateBox" style={{borderColor:index===selectIndex?selectBorder:'#ccc'}}>
                        <div className="candidateTitle">
                            Graph:{value.id}<br/>
                            Nodes:{value.str.nodes} Year:{value.year}
                        </div>
                        <div className="candidateContent">
                            <NodeLink graph={value} onClick={this.selectCondidate} parent={parent}/>
                        </div>
                    </div>
                </div>
            )
        }
        else if (dataType === 'Family') {
            graphElements = this.props.graphs.map((value: graph, index: number) =>
                <div className="forceBox" key={index} onClick={this.selectIndex.bind(this,index)}>
                    <div className="condidateBox" style={{borderColor:index===selectIndex?selectBorder:'#ccc'}}>
                        <div className="candidateTitle">
                            Graph:{value.id}<br/>
                            Nodes:{value.str.nodes} Depth:{value.str.depth}
                        </div>
                        <div className="candidateContent">
                            <TargetTree graph={value} onClick={this.selectCondidate} parent={parent}/>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="forceCompute">
                {graphElements}
            </div>

        )
    }
}
export default ForceCompute;