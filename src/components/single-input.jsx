//-*- mode: rjsx-mode;

import React from 'react';
import ReactDom from 'react-dom';

/** Component which displays a single input widget having the following
 *  props:
 *
 *    `id`:     The id associated with the <input> element.
 *    `value`:  An initial value for the widget (defaults to '').
 *    `label`:  The label displayed for the widget.
 *    `update`: A handler called with the `value` of the <input>
 *              widget whenever it is blurred or its containing
 *              form submitted.
 */
export default class SingleInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
            value:this.props.value ?? '',
            error: '',
          };
    this.handelChange = this.handelChange.bind(this);
    this.handelSubmit = this.handelSubmit.bind(this);
  }

  //@TODO
  handelChange(event){
    this.setState({
      value: event.target.value,
      error:'',
    })
  }


  async handelSubmit(event) {
    event.preventDefault();
    try{
      const value = this.state.value.trim();
      await this.props.update(value);
      this.setState({error:''})
    }
    catch(err){
      const msg = (err.message) ? err.message : 'web service error';
      this.setState({error:msg})
    }
  }

  changeValue(value){
    this.setState({value:value});
  }

  componentDidUpdate(prevProps){
    if(this.props.id !== prevProps.id){
      this.setState({error:'',value:this.props.value ?? '',})
    }
  }

  render() {
    return (
      <form onSubmit = {this.handelSubmit}>
        <label htmlFor={this.props.id}>{this.props.label}</label>
        <span>
            <input name={this.props.id} type = "text" value = {this.state.value} onChange={this.handelChange} onBlur = {this.handelSubmit}></input>
            <br />
            <span className="error">{this.props.error}</span>
        </span>
      </form>
    )
  }

}
