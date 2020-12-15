//-*- mode: rjsx-mode;

import SingleInput from './single-input.jsx';
import {Spreadsheet} from 'cs544-ss';
import SS from './spreadsheet.jsx';

import React from 'react';
import ReactDom from 'react-dom';


/*************************** App Component ***************************/

const STORE = window.localStorage;

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    //this.ssClient = props.ssClient
    this.state = {
      ssName: '',
      spreadsheet: null,
      error: '',
    };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }


  async update(ssName) {
    //@TODO
    let regex = new RegExp(/([A-Za-z0-9])+/)
    try{
      if (regex.test(ssName)){
        const newSheet = await Spreadsheet.make(ssName,this.props.ssClient);
        this.setState({
          ssName:`${ssName}`,
          spreadsheet: newSheet,
          error:'',
        })
      }
      else{
        throw new Error("Spreadsheet name must contain one-or-more alphanumerics, hyphen or space characters.");
      }
    }
    catch(err){
      const msg = (err.message) ? err.message : 'web service error';
      this.setState({error:msg})
    }
  }


  render() {
    const { ssName, spreadsheet } = this.state;
    const ss =
      (spreadsheet) ?  <SS spreadsheet={spreadsheet}/> : '';
    return (
      <div>
        <SingleInput id="ssName" label="Open Spreadsheet Name"
                  value={ssName}  update={this.update} error={this.state.error}/>
        {ss}
     </div>
     );
  }

}
