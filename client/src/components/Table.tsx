import * as React from 'react';
import NodeLink from './NodeLink';
import TargetTree from './TargetTree';



interface Props{
    display:boolean;
    parent: any,
    dataType: string,
    changePage:any,
    attrWeight:number,
    strWeight:number,
    graphs: Array<graph>,
}
type graph = {
    id: number,
    // nodes:Array<number>,
    // edges:Array<edges>,
    [propName: string]: any,
}

class Table extends React.Component<Props,any>{
    constructor(props:Props){
        super(props);
        this.state={data:[]};

    }
    
    componentDidMount():void{

    }
    componentWillReceiveProps(nextProps:Props):void{
        if(nextProps.graphs!==this.props.graphs && nextProps.dataType==="Author"){
            this.setState({data:nextProps.graphs})
        }
    }
    render():React.ReactElement{
        let elements = this.state.data.map((graph: graph, index: number) => {
            let el = null;
           
            if (this.props.dataType === "Author") {
                el = <NodeLink graph={graph} key={index} />;
            }
            else if (this.props.dataType === "Family") {
                el = <TargetTree graph={graph} key={index} />
            }
            let author:Array<React.ReactElement>=[];
            for(let i in graph['authorInfo']){
                let title:Array<React.ReactElement>=[];
                for(let paper in graph["authorInfo"][i]["paper"]){
                    title.push(
                        <div className="paperInfo">
                            {graph["authorInfo"][i]["paper"][paper]["title"]}
                        </div>
                    )
                }
                author.push(<div className="authorInfo">
                    <div className="author">
                        <p>{graph["authorInfo"][i]["name"]}</p>
                        <p>{"year"in graph["authorInfo"][i]?graph["authorInfo"][i]["year"]:graph["authorInfo"][i]["yaer"]}</p>
                    </div>
                    <div className="paper">
                        {title}
                    </div>
                    
                </div>)
            }
            
            let info=<div style={{height: '100%', width: '100%',overflowY:"auto",overflowX:"hidden"}}>{author}</div>
            return (
                <div className='infoBox' key={index} style={{ width: "100%",height:'100%',float:'left',borderBottom:'1px solid #ccc',boxSizing:'border-box' }}>

                    <div style={{ height: '100%', width: '40%', float: 'left' }}>
                        {el}
                    </div>
                    <div style={{ height: '100%', width: '60%', float: 'left',borderLeft:'1px solid #ccc',boxSizing:'border-box' }}>
                        {info}
                    </div>

                </div>
            )
        })
        return(
            <div style={{width:'100%',height:'100%',overflow:'auto'}}>
                {elements}
            </div>
        )
        
    }
}
export default Table;