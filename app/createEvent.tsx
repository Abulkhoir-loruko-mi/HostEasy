import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Button, Image, LayoutAnimation, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


if(Platform.OS==='android' && UIManager.setLayoutAnimationEnabledExperimental){UIManager.setLayoutAnimationEnabledExperimental(true);}

const DATA=[{id:1, title:'Appearance', description:'upload image , event name and description'},
    {id:2, title:'Schedule', description:'set how and when this event is happening'},
    {id:3, title:'Ticket', description:'set the Ticket policy'}
]

const platforms=[
{label:'whatsapp', value:'whatsapp',icon:'whatsapp'},
{label:'telegram', value:'telegram',icon:'telegram'},
{label:'Youtube', value:'youtube',icon:'youtube'},
{label:'Twitter', value:'twiter',icon:'twitter'}
]

const language=[
{label:'English', value:'english'},
{label:'Yoruba', value:'yoruba'},
{label:'Hausa', value:'hausa'},
{label:'Arabic', value:'arabic'}
]

export default function createEvent() {
    const[activeid, setActiveid]=useState(null)
    const[name, setName]=useState('')
    const[description, setDescription]=useState('')
    const[customUrl, setCustomUrl]=useState('')
    const[photo, setPhoto]=useState<string | null>(null)
    const[uploading, setUploading]= useState(false)
    const [online, setOnline]=useState(false)
    const [physical, setPhysical]= useState(false)
    const[PlatformLink, setPlatformlink]=useState('')
    const[selectePlatform, setselectedPlat]=useState(null);
    const[isFocus, setIsFocus] =useState(false)
    const[single, setSingleEvent]=useState(false)
    const[recurring, setRecurring]=useState(false)
    const[selectedDays, setSelectedDays]=useState<Array<string>>([])
    const[startdate, setStartDate]= useState(null)
    const[endDate, setEndDate]=useState(null)
    const [endTime, setEndTime]=useState(null)
    const[starttime, setStartTime]=useState(null)
    const[isStartDatePickerVisible, setStartDatePickerV]=useState(false)
    const[isStartTimePickerVisible, setStartTimePickerVi]=useState(false)
    const[isEndDatePickerVisible, setEndDatePickerV]=useState(false)
    const[isEndTimePickerVisible, setEndTimePickerVi]=useState(false)
    const[ispaid, setIsPaid]= useState(false)
    const [tickets, setTickets]=useState([
        {id:Date.now(), name:'', price:'', quantity:''}
    ])



    const toggleExpand=(id: any)=>{
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveid(id===activeid? null:id)
    }
    const pickImage = async ()=>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:['images'],
            allowsEditing:true,
            aspect:[4,3],
            quality:1
        });
        if (!result.canceled){
            setPhoto(result.assets[0].uri);
        }
    };

    const upLoadToServer=async()=>{
        if(!photo)return;
        setUploading(true);
        let localUri: string = photo;
        let filename: any = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? 'photo/${match[1]}':'photo';

        let formData= new FormData();
        const response = await fetch(localUri);
        const blob = await response.blob();
        formData.append('photo', blob, filename)

        try{
            let response = await fetch('',
                {
                    method:'POST',
                    body:formData,
                    headers:{'content-type':'multipart/form-data'}
                }
            )
            let responseJson = await response.json();
            Alert.alert('success', 'image oploaded!')
            setPhoto(null);

        }catch(error){
            Alert.alert('Error', 'Upload failed')

        }finally{
            setUploading(false)

        }
    }

   

    const handleConfirmStartDate=(date:any)=>{
        if(endDate && date > endDate){
            setEndDate(null);
            Alert.alert('Notice', 'reselect end date')

        }
       setStartDate(date)
        setStartDatePickerV(false)
    }

    const handleConfirmEndDate=(date:any)=>{
        if(startdate && date< startdate){
            setEndDatePickerV(false)
            Alert.alert('Notice', 'End date can not be before start date')
        }

        setEndDate(date)
        setEndDatePickerV(false)
    }

   

    const handleConfirmStartTime =(date:any)=>{
        // If called without a Date (e.g., button onPress), open the picker instead
        if(!date || typeof date?.toLocaleTimeString !== 'function'){
            setStartTimePickerVi(true);
            return;
        }
        setStartTime(date);
        setStartTimePickerVi(false)
        if(endTime && date > endTime){
            setEndTime(null);
            Alert.alert('Notice', 'SElect a new end time')
        }
       
    }

    const handleConfirmEndTime=(date:any)=>{
        // If called without a Date (e.g., button onPress), open the picker instead
        if(!date || typeof date?.toLocaleTimeString !== 'function'){
            setEndTimePickerVi(true);
            return;
        }
        setEndTime(date)
        setEndTimePickerVi(false)
        if(starttime && date < starttime){
            setEndTimePickerVi(false)
            Alert.alert("Invalid Time", "End time is erlier than start time")
            return;
        }
    }

    const formatDate=(dateobj:any)=>{
        if(!dateobj) return 'Select Date';
        
        return dateobj.toDateString();
    };

    const formatTime=(timeobj:any)=>{
        if(!timeobj || typeof timeobj?.toLocaleTimeString !== 'function') return 'Select Time';
        return timeobj.toLocaleTimeString('en-us', {
            hour:'2-digit', minute:'2-digit', hour12:true
        });
    }

    const DAYS = [
        { label: "S", full: 'Sunday' ,index:0 },
        { label: "M", full: 'Monday' ,index:1 },
        { label: "T", full: 'Tuesday' ,index:2 },
        { label: "W", full: 'Wednesday' ,index:3 },
        { label: "T", full: 'Thursday' ,index:4 },
        { label: "F", full: 'Friday' ,index:5 },
        { label: "S", full: 'Saturday' ,index:6 },

    ]

    const toggleDay = (index: number) => {
        if (selectedDays.includes(index.toString())) {
          setSelectedDays(selectedDays.filter((d) => d !== index.toString()));
        } else {
          setSelectedDays([...selectedDays, index.toString()]);
        }
      };

    const addTicketTier=()=>{
        setTickets([
            ...tickets, 
            {id:Date.now(), name:'', price:'', quantity:''}

        ])
    }

    const removeTicketTier=(id:any)=>{
        if(tickets.length===1){
            Alert.alert('Note', "you must have at least one ticket type")
            return;
        }

        setTickets(tickets.filter(t =>t.id !== id));

    }

    const updateTicket=(id:any, field:any, value:any)=>{
        const updatedTickets =tickets.map((ticket)=>{
            if(ticket.id===id){
                return {...ticket, [field]:value};
            }
            return ticket;
        })
        setTickets(updatedTickets);

    }



    const renderContent=(id:any)=>{
        switch(id){
            case 1:
                return(
                    <View style={styles.container}>
                        <TextInput
                        style={styles.input}
                        placeholder='Event name'
                        value={name}
                        onChangeText={setName}
                        />
                        <Text style={[styles.text, {color:'#666', marginBottom:10}]}>chose a clear and descriptive name for your event</Text>
                          <TextInput
                        style={styles.input}
                        placeholder='Event description'
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        
                        />
                        <Text style={[styles.text, {color:'#666', paddingBottom:20}]}>write a description of your event</Text>

                        <TextInput
                        style={styles.input}
                        placeholder='custom url'
                        value={customUrl}
                        onChangeText={setCustomUrl}
                        />
                        <Text style={[styles.text, {color:'#666', marginBottom:20}]}>chose a custom url</Text>

                        <View style={[styles.previewContainer,{backgroundColor:'#34066fff', padding:10}]}>

                            {photo? (
                          
                                 <Image source = {{uri:photo}} style={[styles.image, {backgroundColor:'blue'}]}/>
                 
                            ) : (
                                <View style={styles.placeholderImage }>
                                    
                                    <TouchableOpacity style={{alignItems:'center'}} onPress={pickImage}>
                                        <MaterialIcons name='camera' size={30} />
                                    <Text style={styles.placeHoldertext}>Select Image</Text>


                                    </TouchableOpacity>


                                </View>
                            )}
                           

                            
                            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                                <MaterialIcons style={{color:'white'}} name='sd-card' size={24} />
                            
                                <Text style={{color:'white', padding:10}}>2160 x 1080 recomended</Text>
                                <MaterialIcons style={{color:'white'}} name='storage' size={24} />
                                <Text style={{color:'white'}}>Max 10MB</Text>
                            </View>

                        </View>
                    


                    </View>

                )
            case 2:
                return(
                    <View >
                        <Text style={[styles.title, {fontSize:16, fontWeight:'bold',padding:10}]}>Choose type of location</Text>
                        <View style={{flexDirection:'row', padding:10,alignItems:'center'}}>
                            <Checkbox
                            value={online}
                            onValueChange={setOnline}
                            color={online? '#4630EB' :undefined}
                            />
                            <Text style={{padding:10}}>Online</Text>
                        </View>

                         <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <Checkbox
                            value={physical}
                            onValueChange={setPhysical}
                            color={online? '#4630EB' :undefined}
                            />
                            <Text style={{padding:10}}>Physical</Text>
                        </View>

                         {online && (
                            <View>

                                <Text style={[styles.title,{padding:10} ]}>How do people join your event</Text>
                        <View style={{ padding:10, justifyContent:'space-between'}}>
                            
                                <Dropdown 
                                style={[styles.dropdowns,  isFocus && {borderColor: 'blue'}]}
                                data={platforms}
                                maxHeight={300}
                                labelField='label'
                                valueField='value'
                                placeholder={!isFocus ? 'Select platform': '...'}
                                onChange={item=>{
                                    setselectedPlat(item.value);
                                    setIsFocus(false)
                                }}
                                
                                />

                                

                            
                            
                                <TextInput
                                value={PlatformLink}
                                onChangeText={setPlatformlink}
                                style={[styles.input, {marginTop:10}]}
                                placeholder='Enter Platform link'
                                />

                        </View>
                            </View>
                        )}

                        {physical && (
                            <View>
                                <Text style={[styles.title,{padding:10}]}>Add a place Description</Text>
                                <TextInput
                                style={styles.input}
                                placeholder='Venue Address' />
                            </View>
                        )}


                        



                        

                        <Text style={[styles.title,{padding:10}]}>Language</Text>
                        
                                <Dropdown 
                                style={[styles.dropdowns, isFocus && {borderColor: 'blue'}]}
                                data={language}
                                maxHeight={300}
                                labelField='label'
                                valueField='value'
                                placeholder={!isFocus ? 'Choose Language': '...'}
                                onChange={item=>{
                                    setselectedPlat(item.value);
                                    setIsFocus(false)
                                }}
                                
                                />
                                <></>
                       

                         <Text style={[styles.title,{padding:10}]}>Choose type of event</Text>
                         <View style={{flexDirection:'row'}}>

                            <View style={{flexDirection:'row', padding:10,alignItems:'center'}}>
                            <Checkbox
                            value={single}
                            onValueChange={setSingleEvent}
                            color={single? '#4630EB' :undefined}
                            />
                            <Text style={{padding:10}}>Single Event</Text>
                        </View>

                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <Checkbox
                            value={recurring}
                            onValueChange={setRecurring}
                            color={recurring? '#4630EB' :undefined}
                            />
                            <Text style={{padding:10}}>Recurring</Text>
                        </View>

                       


                         </View>

                         {single && (
                            

                            <View>
                                <Text style={{padding:10, color:'#666'}}>You can set single event details after creating the event</Text>

                                 <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>

                         <View >
                             <Text style={styles.title}>Start Date</Text>
                            
                            <TouchableOpacity style={[styles.pickerbox]} onPress={()=>setStartDatePickerV(true)} >
                                <Text style={{fontSize:16}}>{formatDate(startdate)}</Text>
                                <MaterialIcons name='date-range' size={12}/>

                            </TouchableOpacity>

                            <DateTimePickerModal
                                isVisible={isStartDatePickerVisible}
                                mode='date'
                                onConfirm={handleConfirmStartDate}
                                onCancel={()=>setStartDatePickerV(false)}
                                minimumDate={new Date()}
                                
                                />

                         </View>

                         <View >
                            <Text style={styles.title}>End Date</Text>
                           
                            
                            <TouchableOpacity style={[styles.pickerbox, ]} onPress={()=>setEndDatePickerV(true)} >
                                <Text style={{fontSize:16}}>{formatDate(endDate)}</Text>
                                <MaterialIcons name='date-range' />

                            </TouchableOpacity>
                            <DateTimePickerModal
                                isVisible={isEndDatePickerVisible}
                                mode='date'
                                onConfirm={handleConfirmEndDate}
                                onCancel={()=>setEndDatePickerV(false)}
                                minimumDate={startdate? new Date(startdate):undefined}
                                
                                />

    
                         </View>
                            
                         </View>


                          <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>

                         <View>
                           
                            <Text style={styles.title}>Start Time</Text>
                            <TouchableOpacity style={[styles.pickerbox, ]} onPress={handleConfirmStartTime} >
                                <Text style={{fontSize:16}}>{formatTime(starttime)}</Text>
                                <MaterialIcons name='timer' />

                            </TouchableOpacity>
                            <DateTimePickerModal
                            isVisible={isStartTimePickerVisible}
                            mode='time'
                            onConfirm={handleConfirmStartTime}
                            onCancel={()=>setStartTimePickerVi(false)}
                            minimumDate={new Date()}
                            
                            />
                         </View>

                         <View>
                            
                            <Text style={styles.title}>End Time</Text>
                            <TouchableOpacity style={[styles.pickerbox,]} onPress={handleConfirmEndTime} >
                                <Text style={{fontSize:16}}>{formatTime(endTime)}</Text>
                                <MaterialIcons name='timer'/>

                            </TouchableOpacity>

                            <DateTimePickerModal
                                isVisible={isEndTimePickerVisible}
                                mode='time'
                                onConfirm={handleConfirmEndTime}
                                onCancel={()=>setEndTimePickerVi(false)}
                                 minimumDate={starttime? new Date(starttime):undefined}
                               
                                
                                />


                         </View>
                            
                         </View>


                            </View>
                         )}

                         {!single && (

                           <View>
                                <Text style={{padding:10, color:'#666'}}>You can set recurring event details after creating the event</Text>

                                <View style={{flexDirection:'row', flexWrap:'wrap', justifyContent:'center', marginVertical:10}}>
                                    {
                                    DAYS.map((day)=>{
                                        const isSelected= selectedDays.includes(day.index.toString());
                                        return(
                                            <TouchableOpacity
                                                key={day.index}
                                                style={[styles.dayButton, isSelected && styles.selectedDayButton]}
                                                onPress={() => toggleDay(day.index)}
                                            >
                                                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                }

                                </View>

                                

                                <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>

                         <View>
                           
                            <Text style={styles.title}>Start Time</Text>
                            <TouchableOpacity style={[styles.pickerbox, ]} onPress={handleConfirmStartTime} >
                                <Text style={{fontSize:16}}>{formatTime(starttime)}</Text>
                                <MaterialIcons name='timer' size={24}/>

                            </TouchableOpacity>
                            <DateTimePickerModal
                            isVisible={isStartTimePickerVisible}
                            mode='time'
                            onConfirm={handleConfirmStartTime}
                            onCancel={()=>setStartTimePickerVi(false)}
                            minimumDate={new Date()}
                            
                            />
                         </View>

                         <View>
                            
                            <Text style={styles.title}>End Time</Text>
                            <TouchableOpacity style={[styles.pickerbox,]} onPress={handleConfirmEndTime} >
                                <Text style={{fontSize:16}}>{formatTime(endTime)}</Text>
                                <MaterialIcons name='timer' size={24}/>

                            </TouchableOpacity>

                            <DateTimePickerModal
                                isVisible={isEndTimePickerVisible}
                                mode='time'
                                onConfirm={handleConfirmEndTime}
                                onCancel={()=>setEndTimePickerVi(false)}
                               minimumDate={starttime? new Date(starttime):undefined}
                                
                                />


                         </View>
                            
                         </View>

                           </View>


                         )}

                        
                         

                          

                    </View>

                )
            case 3:
                return(
                    <View style={styles.container}>
                        <View style={styles.switchRow}>
                            <Text> Is this event paid</Text>
                            <Switch 
                            value={ispaid}
                            onValueChange={(val)=> setIsPaid(val)}
                            trackColor={{false: "#767577" , true:'#007Bff'}}
                            ></Switch>
                        </View>

                        <Text style={styles.subHeader}>{ispaid ? "Create Ticket Class(e.g. VIP, REgular)" : "Registration Details"}</Text>

                        {
                            tickets.map((ticket, index)=>(
                                <View key={ticket.id} style={styles.ticketCard}>
                                    <View style={styles.cardHeaderT}>
                                        <Text style={styles.title}>Ticket #{index+1}</Text>
                                        <TouchableOpacity onPress={()=>removeTicketTier(ticket.id)}>
                                            <Ionicons name='trash-outline' size={20} color='red'></Ionicons>
                                        </TouchableOpacity>

                                    </View>

                                    <Text>Ticket Name</Text>

                                    <TextInput
                                     style={styles.input}
                                     placeholder={ispaid? 'e.g., VIP Table' :"e.g., General Admission"}
                                     value={ticket.name}
                                     onChangeText={(text)=> updateTicket(ticket.id, 'name', text)}

                                     />
                                     <View style={{flexDirection:'row'}}>
                                        {ispaid && (
                                            <View style={{flex:1, marginRight:10}}>
                                            <Text> Price(#)</Text>
                                            <TextInput 
                                             style={styles.input}
                                             placeholder='0.00'
                                             keyboardType='numeric'
                                             value={ticket.price}
                                             onChangeText={(text)=>updateTicket(ticket.id, 'price',text)}
                                            />
                                            </View>
                                        )}
                                        <View style={{flex:1}}>
                                            <Text style={styles.label}>Quantity Available</Text>
                                            <TextInput
                                             style={styles.input}
                                             value={ticket.quantity}
                                             placeholder='e.g., 100'
                                             keyboardType='numeric'
                                             onChangeText={(text)=>updateTicket(ticket.id, 'quantity',text)}
                                            
                                            />
                                            
                                        </View>
                                     </View>

                                </View>
                                
                            ))
                        }

                        {
                            ispaid &&(
                                <TouchableOpacity style={styles.addbutton} onPress={addTicketTier}>
                                    <Text>+ Add Another Ticket Type</Text>
                                </TouchableOpacity>
                            )
                        }

                      

                       
                    </View>
                    
                )
        }

    }

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <TouchableOpacity>
          
          <Text style={[{fontSize:20, fontWeight:'bold'}]}>HILAQ</Text>

        </TouchableOpacity>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconPlaceholder}>
          
          
          <Text style={styles.text}>+</Text>

        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconPlaceholder, {backgroundColor:'red'}]}>
          
          <Text style={styles.text}>H</Text>

        </TouchableOpacity>
      </View>
        </View>

        <ScrollView style={styles.containerscr}>
            {DATA.map((item)=>{
                const isOpen=item.id===activeid;

                return(
                    <View key={item.id} style={styles.card}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={()=>toggleExpand(item.id)}
                            style={styles.cardHeader}
                            >
                                
                           
                            
                            <View>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                               
                            </View>
                             <Text style={styles.IconSymbol}>{isOpen? '-' : '+'}</Text>
                        </TouchableOpacity>

                        {isOpen && (
                            <View>
                                {renderContent(item.id)}
                            </View>
                        )}
                    </View>
                )
            })}
        </ScrollView>

        <View style={{flexDirection:'row', justifyContent:'flex-end', alignItems:'baseline'}}>
            <Button title='save as draft' disabled={!photo}
             onPress={upLoadToServer}></Button>
            <Button title='save and continue' disabled={!photo}
             onPress={upLoadToServer}></Button>
       
                               
          </View>
    </View>
  )
}

const styles= StyleSheet.create({
    headerContainer:{
        flexDirection:'row',
        alignItems:'stretch',
        justifyContent:'space-between'
    
    },
    previewContainer:{
        marginBottom:20,
        alignItems:'center'
    },
   placeholderImage:{width:200,
    height:200,
    backgroundColor:'#eee',
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center'
   },
   pickerbox:{
    backgroundColor:'white',
    padding:15,
    borderRadius:8,
    borderWidth:1,
    borderColor:'#ddd',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:10
   },
   disabledbox:{
    backgroundColor:'#eee',
    borderColor:'#eee'
   },
   placeHoldertext:{color:'#888'},
   image:{width:200,
    height:200,
    borderRadius:10
},
    
    containerscr:{
        padding:10,
        //backgroundColor:'red'
    },
    card:{
        marginBottom:10,
        backgroundColor:'#fff',
        borderRadius:8
    },
    dropdown:
        {height:40,
            alignItems:'center',
            justifyContent:'center',
             paddingHorizontal:12,marginEnd:20, borderWidth:1,borderColor:'#ccc'}
    ,
    dropdowns:{
        height:40,
        padding:10,
        borderRadius:5,
        borderWidth:1,
        marginBottom:10,
        borderColor:'#ccc'

        //borderWidth:1
    },
    cardHeader:{
        flexDirection:'row',
        padding:15,
        justifyContent:'space-between',
        alignItems:'center'

    },
    title:{
        fontSize:16,
        fontWeight:'bold'

    },
    description:{
        fontSize:16,
        color:'#666'

    },
   IconSymbol:{
        fontSize:20,
        color:'#007BFF',
        fontWeight:'bold'

    },
    input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    fontSize: 16,
  },

    container:{
        flex:1,
      padding: 20,
      marginTop:40,
      justifyContent:'space-between'
      //alignItems:'center'
    },
     avatar: {
    //width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },

    iconPlaceholder:{
      alignItems:'center',
      justifyContent:'center',
      width:40,
      height:40,
      borderRadius:20,
      backgroundColor:'blue',
      marginRight:10
   },
   text:{
    fontSize:16,
   color:'white',
    //fontStyle:'italic'
   },

    dayButton: {
        width: 40,
        height: 40,
        padding: 10,
        margin: 5,
        borderRadius: 20,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedDayButton: {
        backgroundColor: '#007BFF',
    },
    dayText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    selectedDayText: {
        color: '#fff',
    },

    switchRow:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:20,
        padding:15,
        borderRadius:8,
        borderWidth:1,
        borderColor:'#eee'
    },
    subHeader:{
        fontSize:14,
        fontWeight:'bold',
        marginBottom:15,
        color:'#666'
    },
    ticketCard:{
        backgroundColor:'white',
        padding:15,
        borderRadius:10,
        marginBottom:15,
        borderWidth:1,
        borderLeftWidth:5,
        borderLeftColor:'#007BFF'
    },

    cardHeaderT:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginBottom:15,
        paddingBottom:10,
        borderBottomWidth:1,
        borderBottomColor:"#f0f0f0"

    },
    addbutton:{
        padding:15,
        borderStyle:"dashed",
        borderWidth:1,
        borderColor:'007bff',
        borderRadius:8,
        alignItems:"center",
        marginBottom:20
    },
    label:{
        fontSize:12, color:"#555",
        marginBottom:5

    }
})