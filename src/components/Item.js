import React from "react";

export default class Item extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            item: "",                                                     
            className: "top5-item",
            editActive: false,
        }
    }
    handleBuffer = (name) =>{
        this.setState({item:name})
    }
    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }
    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        },()=>{
            this.props.editCallback(this.state.editActive)
        });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = (event) => {
        if(this.state.item === ""){
            console.log("Item handleBlur: no change");
            this.handleToggleEdit();
        }else{
            console.log("Item handleBlur: " + this.state.item);
            this.props.renameItemCallback(this.props.id,this.state.item);
            this.setState({item: ""});
            this.handleToggleEdit();
        }
    }

    handleDragStart = (event) =>{
        event.dataTransfer.setData("src", this.props.id);
    }

    handleDragover = (event) =>{
        event.preventDefault();
        this.setState({className:"top5-item-dragged-to"}) 
    }
    
    handleDragOut = (event) =>{
        event.preventDefault()
        this.setState({className:"top5-item"})
    }

    handleDrop = (event) =>{
        event.preventDefault();
        if(event.dataTransfer.getData("src") !== event.target.id){
            this.props.moveItemCallback(event.dataTransfer.getData("src"),event.target.id);
        }
        this.setState({className:"top5-item"})
    }

    handleUpdate = (event) => {
        this.setState({ item: event.target.value });
    }
    render() {
        const {name, id} = this.props;
        if (this.state.editActive) {
            return (
                <div id={id} className="top5-item">
                <input
                    id={"item-" + id}
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={name}
                    autoFocus
                />
                </div>
            )
        }
        else{
            return (
                <div id={id} className={this.state.className} onClick={this.handleClick} 
                draggable="true" onDragStart={this.handleDragStart} 
                onDragOver={this.handleDragover} onDrop={this.handleDrop} onDragLeave={this.handleDragOut}>{name}</div>
            )
        }
    }
}