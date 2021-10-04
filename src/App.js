import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            gonnaDeleteThis : null,
            undoStuff: {},
            undoIndex: 0,
            undoButton: "top5-button-disabled",
            redoButton: "top5-button-disabled",
            closeButton: "top5-button-disabled",
            addButton: "top5-button",
        }
    }

    clearTransaction = () =>{
        this.setState({undoStuff: {}, undoIndex: 0, undoButton: "top5-button-disabled",redoButton: "top5-button-disabled"})
    }

    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        if(this.state.addButton !== "top5-button-disabled"){
            
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS

        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.loadList(newKey)
        });
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        if(this.state.currentList === null || key !== '' + this.state.currentList.key){
            let newCurrentList = this.db.queryGetList(key);

            this.setState(prevState => ({
                currentList: newCurrentList,
                sessionData: prevState.sessionData
            }), () => {
                // ANY AFTER EFFECTS?
                this.clearTransaction()
                this.setState({closeButton:"top5-button",addButton:"top5-button-disabled"})
            });
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            this.clearTransaction()
            this.setState({closeButton:"top5-button-disabled",addButton:"top5-button"})
        });
    }
    deleteList = (keyNamePairs) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.showDeleteListModal(keyNamePairs);
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal= (keyNamePairs) =>{
        this.setState({gonnaDeleteThis:keyNamePairs,undoButton:"top5-button-disabled",redoButton:"top5-button-disabled"})        
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }

    actualDeleteList = (listKeyPair) => {

        let newKeyNamePairs = this.state.sessionData.keyNamePairs.filter((pair) => (
            pair.key !== listKeyPair.key
        ))

        let shownList = null
        if(this.state.currentList !== null && listKeyPair.key !== this.state.currentList.key){
            shownList = this.state.currentList
        }
        this.setState(prevState => ({
            currentList: shownList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            if(shownList === null){
                this.clearTransaction()
                this.setState({closeButton:"top5-button-disabled",addButton:"top5-button"})
            }
            this.db.mutationDeleteList(newKeyNamePairs,listKeyPair.key)
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });

        this.hideDeleteListModal()
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
        if (document.activeElement) {
            document.activeElement.blur();
        }
        if(this.state.undoIndex < Object.keys(this.state.undoStuff).length){
            this.setState({redoButton:"top5-button"})
        }
        if(this.state.undoIndex !== 0){
            this.setState({undoButton:"top5-button"})
        }
    }

    renameItem = (id,item,flag) => {
        let newList = {
            key: this.state.currentList.key,
            name: this.state.currentList.name,
            items: this.state.currentList.items
        };
        if(flag === "undo"){
            newList.items[id] = item;
            this.setState({currentList : newList, redoButton : "top5-button"})
        }else if(flag === "redo"){
            newList.items[id] = item;
            this.setState({currentList : newList, undoButton : "top5-button"})
        }else{
            let i = this.state.undoIndex
            let newUndo = this.state.undoStuff
            while(newUndo[i]){
                delete newUndo[i];
                i++
            }
            newUndo[this.state.undoIndex] = {action : "rename", id : id, name : newList.items[id], newName : item}
            newList.items[id] = item;
            this.setState({currentList : newList,undoStuff : newUndo,undoIndex : this.state.undoIndex+1, undoButton : "top5-button", redoButton : "top5-button-disabled"})
        }
        this.db.mutationUpdateList(this.state.currentList);
    }

    moveItem = (src,dest,flag) =>{
        let i = parseInt(src);
        let stepRule = 1;
        let condition = parseInt(dest - src);
        if(i > dest){
            stepRule = -1;
            condition *= -1;
        }
        let newList = {
            key: this.state.currentList.key,
            name: this.state.currentList.name,
            items: this.state.currentList.items
        };
        while(condition !== 0){
            let swap = newList.items[i];
            newList.items[i] = newList.items[i+stepRule];
            newList.items[i+stepRule] = swap;
            i += stepRule;
            condition--;
        }

        if(flag === "undo"){
            this.setState({currentList : newList, redoButton : "top5-button"})
        }else if(flag === "redo"){
            this.setState({currentList : newList, undoButton : "top5-button"})
        }else{
            let i = this.state.undoIndex
            let newUndo = this.state.undoStuff
            while(newUndo[i]){
                delete newUndo[i];
                i++
            }
            newUndo[this.state.undoIndex] = {action : "move", src : dest, dest : src}
            this.setState({currentList : newList,undoStuff : newUndo,undoIndex : this.state.undoIndex+1, undoButton : "top5-button", redoButton : "top5-button-disabled"})
        }

        this.setState({currentList : newList});
        this.db.mutationUpdateList(this.state.currentList);
    }

    undoCurrentList = () =>{
        if(this.state.undoButton !== "top5-button-disabled"){
            let undoIns = this.state.undoStuff[this.state.undoIndex-1]
            let updateUndoButton = "top5-button"
            if(this.state.undoIndex===1){
                updateUndoButton = "top5-button-disabled"
            }
            if(undoIns.action === "rename"){
                this.setState({undoIndex : this.state.undoIndex-1, undoButton : updateUndoButton}, () => {
                    this.renameItem(undoIns.id,undoIns.name,"undo");
                });
            }
            if(undoIns.action === "move"){
                this.setState({undoIndex : this.state.undoIndex-1, undoButton : updateUndoButton}, () => {
                    this.moveItem(undoIns.src,undoIns.dest,"undo");
                });
            }
        }
    }

    redoCurrentList = () =>{
        if(this.state.redoButton !== "top5-button-disabled"){
            let undoIns = this.state.undoStuff[this.state.undoIndex]
            let updateRedoButton = "top5-button"
            if(this.state.undoIndex===(Object.keys(this.state.undoStuff).length - 1)){
                updateRedoButton = "top5-button-disabled"
            }
            if(undoIns.action === "rename"){
                this.setState({undoIndex : this.state.undoIndex+1, redoButton : updateRedoButton}, () => {
                    this.renameItem(undoIns.id,undoIns.newName,"redo");
                });
            }
            if(undoIns.action === "move"){
                this.setState({undoIndex : this.state.undoIndex+1, redoButton : updateRedoButton}, () => {
                    this.moveItem(undoIns.dest,undoIns.src,"redo");
                });
            }
        }
    }

    handleKeyPress = (event) => {
        if (event.keyCode === 90 && event.ctrlKey){this.undoCurrentList();}
        if (event.keyCode === 89 && event.ctrlKey) this.redoCurrentList();
    }

    componentDidMount(){
        document.addEventListener("keyup", this.handleKeyPress,true);
    }
    componentWillUnmount(){
        document.removeEventListener("keyup", this.handleKeyPress,true);
    }


    editing = (editActive) =>{
        if(editActive){
            this.setState({undoButton:"top5-button-disabled",redoButton:"top5-button-disabled"})
        }else{
            if(this.state.undoIndex < Object.keys(this.state.undoStuff).length){
                this.setState({redoButton:"top5-button"})
            }
            if(this.state.undoIndex !== 0){
                this.setState({undoButton:"top5-button"})
            }
        }
    }

    render() {
        return (
            <div id="app-root" onKeyDown={this.handleKeyPress}>
                <Banner 
                    title='Top 5 Lister'
                    undoButton={this.state.undoButton}
                    redoButton={this.state.redoButton}
                    closeButton={this.state.closeButton}
                    closeCallback={this.closeCurrentList} 
                    undoCallback={this.undoCurrentList}
                    redoCallback={this.redoCurrentList}
                />
                <Sidebar
                    heading='Your Lists'
                    addButton={this.state.addButton}
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    editCallback={this.editing}
                />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback={this.renameItem}
                    moveItemCallback={this.moveItem}
                    editCallback={this.editing}    
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.gonnaDeleteThis}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    actualDeleteListCallback={this.actualDeleteList}
                />
            </div>
        );
    }
}

export default App;
