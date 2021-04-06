import * as React from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import {Switch} from 'antd';



interface Props {
    reTsneData: any,
    url: string,
    centerPoint: any,
    choosePoints: any,
    attrWeight: number,
    parent: any,
    attrValue: attr,
    attrChecked: attr,
    dataType: string,
    personGraphs: Array<attr>
}
type attr = {
    [propName: string]: any,
}

class Parallel extends React.Component<Props, any>{
    private svgRef: React.RefObject<SVGSVGElement>;
    public svgWidth: number = 0;
    public svgHeight: number = 0;
    public padding = { top: 30, bottom: 30, left: 50, right: 100 };
    public pathStroke: string = '#2987E4';
    public pathStrokeChoose: string = '#ccc'//'#99CCFF';'#2987E4'
    public pathStrokeCenter: string = 'red';
    // public rectColor:Array<string>=['#FEF0D9','#FDCC8A','#FC8D59','#E34A33','#B30000'];
    public rectHeight: number = 10;
    public yscale: any = null;
    public xscale: any = null;
    public rectWidthMax: number = 0;
    // public rectColor=d3.interpolate(d3.rgb(254,240,217),d3.rgb(179,0,0));
    public rectColor = d3.interpolateYlOrRd;
    // public color = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"];
    constructor(props: Props) {
        super(props);
        this.svgRef = React.createRef();
        this.state = { data: [], rect: {},rectArray:{}, opacity:0.7,personGraphsOpacity:1,polygonHull:[]};
        this.getAttrData = this.getAttrData.bind(this);
        this.compute = this.compute.bind(this);
        this.doInterpolate=this.doInterpolate.bind(this);
        this.switch=this.switch.bind(this);
    }
    compute(data: any, updateAttr: boolean): void {
        let attr_name: Array<string> = [];
        let str_name: Array<string> = [];
        let rectNum = Math.ceil((this.svgHeight - this.padding.bottom - this.padding.top) / this.rectHeight) + 1;
        let rectArray: attr = {};
        for (let key in data[0].attr) {
            attr_name.push(key);
            rectArray[key] = [];
        }
        for (let key in data[0].str) {
            str_name.push(key);
        }
        //x方向比例尺
        let xscale = d3.scalePoint(attr_name, [this.padding.left, this.svgWidth - this.padding.right]);
        this.xscale=xscale;
        //y方向比例尺
        let min_max: any = new Map(Array.from(attr_name, key => [key, d3.extent(data, (d: any) => d.attr[key])]));
        let attr: attr = {};
        let checked: attr = {};
        attr_name.forEach((value: string) => {
            checked[value] = true;
            attr[value] = min_max.get(value);
        })
        if (updateAttr) {
            this.props.parent.setAttr(attr);
            this.props.parent.initAttrChecked(checked);
            this.props.parent.setAttrList(attr_name);
            this.props.parent.setStrList(str_name);
        }

        let yscale: any = new Map(Array.from(attr_name, key => [key, d3.scaleLinear(min_max.get(key), [this.svgHeight - this.padding.bottom, this.padding.top])]));
        this.yscale = yscale;
        for (let i in rectArray) {
            for (let j = 0; j < rectNum; j++) {
                rectArray[i].push([xscale(i), this.svgHeight - this.padding.bottom - j * this.rectHeight, 0, 0])//[x,y,height,color]
            }
        }
        for (let i in data) {
            let pathData = [];
            for (let j in data[i].attr) {
                let y = Math.floor((this.svgHeight - this.padding.bottom - yscale.get(j)(data[i].attr[j])) / this.rectHeight);
                rectArray[j][y][3] += 1;//data[i].attr[j];
                pathData.push([xscale(j), yscale.get(j)(data[i].attr[j])]);
                rectArray[j][y][2] += 1;
            }
            data[i].pathData = pathData;
        }
        let rectx1 = xscale(attr_name[1]) || 0;
        let rectx2 = xscale(attr_name[0]) || 0;
        let rectWidthMax = (rectx1 - rectx2) / 4 > this.padding.left - 5 ? this.padding.left - 5 : (rectx1 - rectx2) / 4;
        this.rectWidthMax = rectWidthMax;
        console.log(rectArray)
        for (let i in rectArray) {
            let v = d3.extent(rectArray[i], (d: Array<number>) => { return Math.sqrt(d[2]) });
            let c = d3.extent(rectArray[i], (d: Array<number>) => { return Math.sqrt(d[3]) })//d[3]/d[2]});
            if (v[0] === v[1] && c[0] === c[1])
                c[0] = 0;
            let rectWidthScale = d3.scaleLinear(v as unknown as any, [5, rectWidthMax]);
            // let mean=d3.mean(rectArray[i],(d:any)=>d[3])||0;
            // let std=this.getStd(rectArray[i],mean);
            // console.log(mean,std)
            let colorScale = d3.scaleLinear(c as unknown as any, [0.05,0.9]);

            rectArray[i].forEach((value: Array<number>) => {
                
                    // value[3] = colorScale(Math.sqrt(value[3]))//value[3]/value[2]);
                    value[2] = rectWidthScale(Math.sqrt(value[2]));
                    // value[3]=(value[3]-mean)/std/4+0.5;
                
                
            })

        }
        d3.select("#svg_parallel")
            .select(".axis")
            .selectAll("g")
            .remove()
        d3.select("#svg_parallel")
            .select(".text")
            .selectAll("g")
            .remove()
        for (let i = 0; i < attr_name.length; i++) {
            d3.select("#svg_parallel")
                .select(".axis")
                .append("g")
                .attr("transform", `translate(${xscale(attr_name[i])},0)`)
                .call(d3.axisRight(yscale.get(attr_name[i])).ticks(5))
            d3.select("#svg_parallel")
                .select(".text")
                .append("g")
                .append('text')
                .attr("x", -6)
                .attr("y", -6)
                .attr("text-anchor", "start")
                .attr("fill", "black")
                .text(attr_name[i])
                .attr('font-size', 12)
                .attr("transform", `translate(${xscale(attr_name[i])},${this.svgHeight})`)
        }


        this.setState({ data: data,rectArray:rectArray});
        this.doInterpolate(rectArray);
    }
    getAttrData(dataType: string): void {
        axios.post(this.props.url+'/getAttr', { dataType: dataType })
            .then(res => {
                this.compute(res.data.data, true);
            })
    }
    componentDidMount(): void {
        this.svgWidth = this.svgRef.current?.clientWidth || 0;
        this.svgHeight = this.svgRef.current?.clientHeight || 0;
        this.getAttrData(this.props.dataType);
    }

    line(data: [[number, number]]): string {//生成路径
        let d = '';
        for (let i = 0; i < data.length; i++) {
            if (i === 0)
                d += `M${data[i][0]} ${data[i][1]} `;
            else
                d += `L${data[i][0]} ${data[i][1]} `;
        }
        // d=d3.line().curve(d3.curveBasis)(data) as unknown as string;
        return d;
    }
    // getStd(values: Array<number>,mean:number,valueof: (datum: any, index: number, array: Iterable<number>) => number
    // ):number{
    //     let count = 0;
    //     let sum = 0;
    //     if (valueof === undefined) {
    //         for (let value of values) {
    //         if (value != null ) {
    //             ++count, sum += Math.pow(value-mean,2);
    //         }
    //         }
    //     } else {
    //         let index = -1;
    //         for (let value of values) {
    //             if ((value = valueof(value, ++index, values)) != null) {
    //                 ++count, sum += Math.pow(value-mean,2);
    //             }
    //         }
    //     }
    //     return Math.sqrt(sum)/ count;

    // }
    getStd(values: any, mean: number): number {
        let count = 0, sum = 0;
        for (let i in values) {
            sum += Math.pow(values[i][3] - mean, 2);
            count += 1;
        }
        return Math.sqrt(sum) / count;
    }
    doInterpolate(value:any):void{
        axios.post(this.props.url+'/doInterpolate',{data:value,num:20})
        .then(res=>{
            for (let i in res.data.data) {
                let c = d3.extent(res.data.data[i], (d: Array<number>) => { if (d[2] !== 0) return d[3] })//d[3]/d[2]});

                let colorScale = d3.scaleLinear(c as unknown as any, [0.05,0.9]);
    
                res.data.data[i].forEach((value: Array<number>) => {
                    if (value[2] !== 0 ) {
                        value[3] = colorScale(value[3])//value[3]/value[2]);
                    }
                })
    
            }
            this.setState({rect:res.data.data});
        })
    }
    switch(value:boolean){
        if(value===false){
            this.setState({opacity:0});
        }
        else{
            this.setState({opacity:0.7});
        }
    }
    componentWillReceiveProps(nextProps: Props) {
        if (JSON.stringify(nextProps.attrValue) !== JSON.stringify(this.props.attrValue) && JSON.stringify(nextProps.centerPoint) !== '{}' && JSON.stringify(nextProps.centerPoint) !== JSON.stringify(this.props.centerPoint)) {
            const data = JSON.parse(JSON.stringify(this.state.data));
            const { attrValue } = nextProps;

            let checkedArr: any = [];
            for (let key in nextProps.attrChecked) {
                if (nextProps.attrChecked[key] === true)
                    checkedArr.push({ name: key, value: true })
            }

            data.forEach((value: any) => {
                for (let i in checkedArr) {
                    let attr = value.attr[checkedArr[i].name];
                    if (attr < attrValue[checkedArr[i].name][0] || attr > attrValue[checkedArr[i].name][1]) {
                        value.opacity = 0;
                        return;
                    }
                }
                value.opacity = 0.1
            })
            this.setState({ data: data });
        }
        if (nextProps.reTsneData !== this.props.reTsneData && nextProps.reTsneData.length!=0) {
            const { attrValue, attrChecked } = nextProps;
            let reTsneData = JSON.parse(JSON.stringify(nextProps.reTsneData));
            let checkedArr: any = [];
            for (let key in attrChecked) {
                if (attrChecked[key] === true)
                    checkedArr.push({ name: key, value: true })
            }
            reTsneData.forEach((value: any) => {
                for (let i in checkedArr) {
                    let attr = value.attr[checkedArr[i].name];
                    if (attr < attrValue[checkedArr[i].name][0] || attr > attrValue[checkedArr[i].name][1]) {
                        value.opacity = 0;
                        return;
                    }
                }
                value.opacity = 0.1
            })
            this.compute(reTsneData, false);
        }
        if (nextProps.dataType !== this.props.dataType) {
            this.getAttrData(nextProps.dataType);
        }
        if(nextProps.centerPoint!==this.props.centerPoint){
            this.setState({personGraphsOpacity:0})
        }
        if(nextProps.personGraphs!==this.props.personGraphs){
            this.setState({personGraphsOpacity:1})
        }
        if (nextProps.choosePoints !== this.props.choosePoints) {
            let pointsMax:any={};
            let pointsMin:any={};
            let points1:any=[];
            let points2:any=[];
            let points:any=[];
            let rectArray = JSON.parse(JSON.stringify(this.state.rectArray));
            for (let i in rectArray) {
                rectArray[i].forEach((value: Array<number>) => {
                    value[2] = 0;
                    value[3] = 0;
                })
            }

            nextProps.choosePoints.forEach((value: any) => {
                for (let i in value.attr) {
                    let y = Math.floor((this.svgHeight - this.padding.bottom - this.yscale.get(i)(value.attr[i])) / this.rectHeight);
                    rectArray[i][y][2] += 1;
                    rectArray[i][y][3] += value.attr[i];
                    if(i in pointsMax){
                        let py=this.yscale.get(i)(value.attr[i]);
                        if(pointsMax[i]<py)
                            pointsMax[i]=py
                    }
                    else{
                        pointsMax[i]=this.yscale.get(i)(value.attr[i]);
                    }
                    if(i in pointsMin){
                        let py=this.yscale.get(i)(value.attr[i]);
                        if(pointsMin[i]>py)
                            pointsMin[i]=py
                    }
                    else{
                        pointsMin[i]=this.yscale.get(i)(value.attr[i]);
                    }
                    points.push([this.xscale(i),this.yscale.get(i)(value.attr[i])])
                    
                }
                
            })
            for(let i in pointsMax){
                    points1.push([this.xscale(i),pointsMax[i]]);
                    points2.push([this.xscale(i),pointsMin[i]]);
            }

            points1=points1.concat(points2.reverse())

            let rectWidthMax = this.rectWidthMax;
            // console.log(rectArray)
            for (let i in rectArray) {
                let v = d3.extent(rectArray[i], (d: Array<number>) => { if (d[2] !== 0) return d[2] });
                let c = d3.extent(rectArray[i], (d: Array<number>) => { if (d[2] !== 0) return d[3] });
                let rectWidthScale = d3.scaleLinear(v as unknown as any, [5, rectWidthMax]);
                // let mean=d3.mean(rectArray[i],(d:any)=>d[3])||0;
                // let std=this.getStd(rectArray[i],mean);
                // console.log(mean,std)
                // if (v[0] === v[1] && c[0] === c[1])
                //     c[0] = 0;
                // let colorScale = d3.scaleLinear(c, [0.05,0.9]);

                rectArray[i].forEach((value: Array<number>) => {
                    if (value[2] !== 0) {
                        // value[3] = colorScale(value[3] / value[2]);
                        value[2] = rectWidthScale(Math.sqrt(value[2]));
                        // value[3]=(value[3]-mean)/std/4+0.5;
                    }
                })
            }
            this.setState({ rect: rectArray ,polygonHull:points});
            this.doInterpolate(rectArray);
        }
    }
    render() {
        // 所有线
        let path = this.state.data.map((value: any, index: number) => {
            if (this.props.choosePoints.length === 0 && this.props.personGraphs.length===0)
                return (<path d={this.line(value.pathData)} key={index} strokeWidth={0.5} strokeOpacity={'opacity' in value ? value.opacity : 0.1} stroke={this.pathStroke} fill='none' ></path>)
            else
                return (<path d={this.line(value.pathData)} key={index} strokeWidth={0.5} strokeOpacity={'opacity' in value ? value.opacity : 0.1} stroke={this.pathStrokeChoose} fill='none' ></path>)

        }
        )
        //圈选的点，匹配到的点
        let pathChoose = this.props.choosePoints.map((value: any, index: number) => {
            for (let i in this.state.data) {
                if (this.state.data[i].id === value.id) {
                    return (<path d={this.line(this.state.data[i].pathData)} key={index} strokeWidth={0.5} strokeOpacity={1} stroke={this.pathStroke} fill='none'></path>)
                }
            }
            return null;
        })
        //点击的点，需要匹配的点
        let pathCenter = null;
        for (let i in this.state.data) {
            if (this.state.data[i].id === this.props.centerPoint.id) {
                pathCenter = <path d={this.line(this.state.data[i].pathData)} strokeWidth={1.5} strokeOpacity={1} stroke={this.pathStrokeCenter} fill='none'></path>
                break;
            }
        }

        //点击的点，试选
        let personGraphs = this.props.personGraphs.map((value: any, index: number) => {
            for (let i in this.state.data) {
                if (this.state.data[i].id === value.id) {
                    return (<path d={this.line(this.state.data[i].pathData)} key={index} strokeWidth={1.5} strokeOpacity={1} stroke={index===0?this.pathStrokeCenter:this.pathStroke} fill='none' opacity={this.state.personGraphsOpacity}></path>)
                }
            }
            return null;
        })
        

        //画矩形
        // let rectLeft:Array<React.ReactElement>=[];
        // let rectRight:Array<React.ReactElement>=[];
        //画高斯曲线

        let curve = d3.line().curve(d3.curveBasisClosed);
        let pathGaosi: Array<React.ReactElement> = [];
        let Gradient: Array<React.ReactElement> = [];
        for (let i in this.state.rect) {
            let pathPointsLeft: Array<Array<number>> = [];
            let pathPointsRight: Array<Array<number>> = [];
            let stop: Array<React.ReactElement> = [];
            this.state.rect[i].forEach((value: Array<number>, index: number) => {
                if (value[2] !== 0) {
                    pathPointsLeft.push([value[0] - value[2], value[1]]);
                    pathPointsRight.push([value[0] + value[2], value[1]]);

                    // rectRight.push(<rect key={index+'i'+i} x={value[0]-value[2]} y={value[1]-this.rectHeight} height={this.rectHeight} fill={this.rectColor(value[3])} width={value[2]}></rect>)
                    // rectLeft.push(<rect key={index+'l'+i} x={value[0]} y={value[1]-this.rectHeight} height={this.rectHeight} fill={this.rectColor(value[3])} width={value[2]}></rect>)
                }
            })
            for(let index=this.state.rect[i].length-1;index>=0;index--){
                let offset =(1-index / this.state.rect[i].length) * 100 + "%";
                // stop.push(<stop key={i+index} offset={offset} stopColor={this.color[this.state.rect[i][index][3]]}></stop>);
                
                stop.push(<stop key={i+index} offset={offset} stopColor={this.rectColor(this.state.rect[i][index][3])}></stop>);

            }

            let d = curve(pathPointsRight.concat(pathPointsLeft.reverse()) as unknown as [number, number][]) as unknown as string | undefined;
            Gradient.push(<linearGradient key={'lineColor' + i} id={'lineColor' + i} x1="0%" y1="0%" x2='0%' y2="100%">{stop}</linearGradient>)
            pathGaosi.push(<path d={d} fill={'url(#lineColor' + i + ')'} fillOpacity={this.state.opacity} key={i}></path>);
        }

        // let polygonHullEl=null;
        if(this.state.polygonHull.length>0){
            
            // let createCurve=d3.line()
            // polygonHullEl=<path d={createCurve(this.state.polygonHull) as unknown as string} fill="#red" fillOpacity={0.5}></path>
        }

        return (
            <div className='parallel'>
                <Switch className="parallelSwitch" defaultChecked size="small" style={{position:'absolute',right:'15px',top:'5px'}} onChange={this.switch} />
                <svg style={{ width: '100%', height: '100%' }} ref={this.svgRef} id='svg_parallel'>
                    <defs>
                        <linearGradient id='linearColor' x1="0%" y1="0%" x2='0%' y2="100%">
                            <stop offset="0%" stopColor={this.rectColor(1)}></stop>
                            <stop offset="20%" stopColor={this.rectColor(0.8)}></stop>
                            <stop offset="40%" stopColor={this.rectColor(0.6)}></stop>
                            <stop offset="60%" stopColor={this.rectColor(0.4)}></stop>
                            <stop offset="80%" stopColor={this.rectColor(0.2)}></stop>
                            <stop offset="100%" stopColor={this.rectColor(0)}></stop>
                        </linearGradient>
                        {Gradient}
                    </defs>
                    {path}
                    {pathChoose}
                    {pathCenter}
                    {personGraphs}
                    {pathGaosi}
                    {/* {polygonHullEl} */}
                    <g className="axis"></g>
                    <g className="text"></g>
                    <text x={this.svgWidth-this.padding.right} y={15} fontSize="10px">HeatMap</text>
                    <rect fill='url(#linearColor)' x={this.svgWidth - this.padding.right / 2 + 10} y={this.svgHeight - this.padding.bottom - 100} height={100} width={20}></rect>
                    {/* <text style={{transform:`translate(${this.svgWidth-this.padding.right+85}px,${this.svgHeight-this.padding.bottom-100}px) rotate(90deg)`}}>Z-score</text> */}
                    {/* <text x={this.svgWidth - this.padding.right / 2 - 5} y={this.svgHeight - this.padding.bottom - 95}>2</text> */}
                    {/* <text x={this.svgWidth - this.padding.right / 2 - 5} y={this.svgHeight - this.padding.bottom - 50}>0</text> */}
                    {/* <text x={this.svgWidth - this.padding.right / 2 - 5} y={this.svgHeight - this.padding.bottom}>-2</text> */}
                </svg>
            </div>
        )
    }
}
export default Parallel;