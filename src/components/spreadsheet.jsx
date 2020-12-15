//-*- mode: rjsx-mode;

import {indexToRowSpec, indexToColSpec} from 'cs544-ss';
import popupMenu from '../lib/menu.jsx';
import SingleInput from './single-input.jsx';

import React from 'react';
import ReactDom from 'react-dom';


/************************ Spreadsheet Component ************************/

const [ N_ROWS, N_COLS ] = [ 10, 10 ];
const ROW_HDRS = Array.from({length: N_ROWS}).map((_, i) => indexToRowSpec(i));
const COL_HDRS = Array.from({length: N_COLS}).
  map((_, i) => indexToColSpec(i).toUpperCase());

export default class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter : 0,
      copyCell: "",
      error:null,
      cellId:'',
      focusedCell:"",
      focusedCellFormula:"",
    }
    this.MinRows = 10;
    this.MinCols = 10;
    this.cellData = [];
    this.renderRows = this.renderRows.bind(this);
    this.generateTable = this.generateTable.bind(this);
    this.onFocusHandler = this.onFocusHandler.bind(this);
    this.populateTable = this.populateTable.bind(this);
    this.update = this.update.bind(this);
    this.clear = this.clear.bind(this);
    this.menuHandler = this.menuHandler.bind(this);
    this.delete = this.delete.bind(this );
    this.copy = this.copy.bind(this);
    this.paste = this.paste.bind(this);
    this.dataHandler = this.dataHandler.bind(this);
    this.getFormula = this.getFormula.bind(this);
  }

  //Return array entry according
  renderRows(row){
    return this.cellData[row - 1];
  }

  //Save CellInfos for those cell that has value
  generateTable(){
    const ssData = this.props.spreadsheet.dump();
    let cellDic = {};
    for(let i of ssData){
      cellDic[ i[0] ] = i[1];
    }
    return cellDic;
  }

  //populate data for ssCell table
  populateTable(){
    let tableIndex = 0;
    const cellDic = this.generateTable();
    this.cellData = [];
    for(let i = 0; i < this.MinRows; i++){
      let tempArray = [];
      for(let j = 0; j < this.MinCols; j++){
        let cellId = this.coorToCellID(i, j);
        let formula = "";
        let value = "";
        let className = "ss";
        if(this.state.focusedCell === cellId){
          className = "focused"
        }
        else if (this.state.copyCell === cellId){
          className = "copied"
        }
        if(cellId in cellDic){
          const data = this.props.spreadsheet.query(cellId);
          formula = data.formula;
          value = data.value;
        }
        const temp = {
          cellId: cellId,
          formula : formula, 
          onFocus: this.onFocusHandler,
          onContextMenu: this.dataHandler,
          value: value, 
          tabIndex: tableIndex,
          className:className,
        }
        tempArray.push(SSCell(temp));
        tableIndex += 1
      }
      this.cellData.push(tempArray);
    }
  }
  
  coorToCellID(i, j){
    const col = String.fromCharCode(97 + j);
    return `${col}${i+1}`;
  }

  onFocusHandler(event){
    const cell = event.target.dataset.cellid;
    this.setState({
      focusedCell: cell,
      error:"",
    })
  }

  async update(expression){
    try{
      const a = await this.props.spreadsheet.eval(this.state.focusedCell, expression);
      this.setState({counter: this.state.counter += 1})
    }
    catch(err){
      const msg = (err.message) ? err.message : 'web service error';
      this.setState({error:msg})
    }
  }

  async clear(){
  try{
      const a = await this.props.spreadsheet.clear();
      this.setState({counter: this.state.counter += 1})
    }
    catch(err){
      const msg = (err.message) ? err.message : 'web service error';
      this.setState({error:msg})
    }
  }

  async delete(){
    try{
      const a = await this.props.spreadsheet.delete(this.state.focusedCell);
      this.setState({counter: this.state.counter += 1})
    }
    catch(err){
      const msg = (err.message) ? err.message : 'web service error';
      this.setState({error:msg})
    }
  }

  async copy(){
    this.setState({copyCell:this.state.focusedCell});
  }

  async paste(){
    try{
      const a = await this.props.spreadsheet.copy(this.state.focusedCell,this.state.copyCell);
      this.setState({counter: this.state.counter += 1})
    }
    catch(err){
      const msg = (err.message) ? err.message : 'web service error';
      this.setState({error:msg})
    }
  }

  //for clear
  menuHandler(event){
    const clearMenu={
      menuItems: [
        { menuLabel: 'Clear', menuItemFn:this.clear, },
        ],
      };
      event.preventDefault();
      popupMenu(event, clearMenu);
  }

  //for cells
  dataHandler(event){
    const title = event.target.title;
    const curCellId = event.target.dataset.cellid;
    const dataMenu={
      menuItems: [
        { menuLabel: 'Delete', menuItemFn:(title!=='') ? this.delete : null,},
        { menuLabel: 'Copy', menuItemFn:(title!=='') ? this.copy:null,},
        { menuLabel: 'Paste', menuItemFn:(title!=='' || this.state.copyCell!=='') ? this.paste:null,},
        ],
      };
      event.preventDefault();
      popupMenu(event, dataMenu);
  }

  //no usage
  getFormula(){
    const data = this.props.spreadsheet.query(this.state.focusedCell);
    return data.formula;
  }

  render() {
    this.populateTable();
    const valueFormulas = this.props.spreadsheet.valueFormulas();
    const cellId = this.state.focusedCell;
    const formula = (cellId && valueFormulas[cellId]?.formula) || '';
    return (
      <div>
            <div>
            <SingleInput id={cellId} label={this.state.focusedCell.toUpperCase()}
                     value={formula} update={this.update} error={this.state.error}/>
            </div>
      <table className="ss">
        <thead>
        <tr>
            <th onContextMenu={this.menuHandler}>{this.props.spreadsheet.name}</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
            <th>E</th>
            <th>F</th>
            <th>G</th>
            <th>H</th>
            <th>I</th>
            <th>J</th>
        </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            {this.renderRows(1).map(index => index)}
          </tr>
          <tr>
            <th>2</th>
            {this.renderRows(2).map(index => index)}
          </tr>
          <tr>
            <th>3</th>
            {this.renderRows(3).map(index => index)}
          </tr>
          <tr>
            <th>4</th>
            {this.renderRows(4).map(index => index)}
          </tr>
          <tr>
            <th>5</th>
            {this.renderRows(5).map(index => index)}
          </tr>
          <tr>
            <th>6</th>
            {this.renderRows(6).map(index => index)}
          </tr>
          <tr>
            <th>7</th>
            {this.renderRows(7).map(index => index)}
          </tr>
          <tr>
            <th>8</th>
            {this.renderRows(8).map(index => index)}
          </tr>
          <tr>
            <th>9</th>
            {this.renderRows(9).map(index => index)}
          </tr>
          <tr>
            <th>10</th>
            {this.renderRows(10).map(index => index)}
          </tr>
        </tbody>
      </table>
      </div>
    )
  }
}

function SSCell(props) {
  const { cellId, formula, value, onContextMenu, onFocus,
          className, tabIndex } = props;
  return (
    <td onContextMenu={onContextMenu}
        data-cellid={cellId}
        onFocus={onFocus}
        className={className}
        tabIndex={tabIndex}
        title={formula ?? ''}>
      {value ?? ''}
    </td>
  );
}
