//import styles from '@/constants/styles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { supabase } from './lib/supabase';


export default function PublishEvent({route}:any) {
    const navigation = useNavigation<any>();
    const { eventId, previewImage, previewTitle,startDate=new Date().toISOString(),description } = route.params || {};
    const[creatorName, setCreatorname]= useState('loading...')
    const[publishOption, setPublishOption]=useState('now')
    const[showDatePicker, setShowDatePicker]= useState(false)
    const[scheduleDate, setScheduleDate]=useState(new Date())
     const[isFocus, setIsFocus]=React.useState(false)
    const[redirectUrl,setRedirectUrl]=useState<string>('')
   const [errors, setErrors] = useState<Record<string, string>>({});
    const[category, setCategory]=useState(null)
    const[subcategory,setSubcategory]=useState(null)
    const[tags, setTags]=useState<string>('')
    const [loading, setLoading] = useState(false);
    const [subCategoryData, setSubCategoryData] = useState<{ label: string; value: string }[]>([]);


      const categoryData = [
        { label: 'Technology', value: 'tech' },
        { label: 'Music', value: 'music' },
        { label: 'Business', value: 'business' },
        { label: 'Religious', value: 'religious' },
        { label: 'Islamic History', value: 'islamic_history' },
        { label: 'Technology & Innovation', value: 'tech' },
        { label: 'Health & Wellness', value: 'health' },

      ];

           const ErrorText = ({ error }:any) => {
          if (!error) return null;
          return <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{error}</Text>;
      }

        useEffect(()=>{
          const getUser=async()=>{
            const { data: { user }, error } = await supabase.auth.getUser();
            setCreatorname(user?.user_metadata?.full_name || user?.email || 'Unknown user')
          }
          
          getUser()
        },[])


    const validatePublishForm = () => {
      let isValid = true;
      let tempErrors: Record<string, string> = {};

      // --- Category ---
      if (!category) {
        tempErrors.category = "Please select a category";
        isValid = false;
      }

      // --- Redirect URL (Regex check) ---
      // Simple regex to check for http:// or https:// followed by something
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (redirectUrl && !urlRegex.test(redirectUrl)) {
          tempErrors.redirectUrl = "Please enter a valid URL (e.g., https://google.com)";
          isValid = false;
      }

      // --- Scheduling Logic ---
      if (publishOption === 'later') {
          // Check if scheduledDate is in the past (allowing a small buffer of 1 minute for slow presses)
          const nowPlusBuffer = new Date(new Date().getTime() - 60000);
          if (scheduleDate < nowPlusBuffer) {
              // We don't necessarily need an UI error text for this, an Alert is fine here
              Alert.alert("Schedule Error", "You cannot schedule an event in the past. Please select a future date.");
              isValid = false;
              // Alternatively, set a state to turn the date picker text red
              // tempErrors.schedule = true; 
          }
      }

      setErrors(tempErrors);
      return isValid;
    };


   const handlePublish = async () => {
    // 1. Basic Validation
   if (!validatePublishForm()) {
         // If it's just category/url errors, show generic alert
         if (Object.keys(errors).length > 0) {
             Alert.alert("Validation Error", "Please check the highlighted fields.");
         }
         return;
    }

    setLoading(true);

    let updatePayload = {
        category: category,
        // Assuming you add subcategory and tags to DB later
         subcategory: subcategory, 
         tags: tags,
        redirect_url: redirectUrl,
        status:'scheduled',
        publish_at:''
    };

    // 2. DETERMINE STATUS AND PUBLISH TIME
    const currentTime = new Date().toISOString();

    if (publishOption === 'now') {
        // OPTION A: Publish Immediately
        updatePayload.status = 'published';
        // Set publish_at to right now, so it passes the RLS check immediately
        updatePayload.publish_at = currentTime; 
    } else {
        // OPTION B: Schedule for Later
        // Validate that scheduledDate is actually in the future
        if (scheduleDate <= new Date()) {
             setLoading(false);
             Alert.alert("Error", "Scheduled time must be in the future.");
             return;
        }

        updatePayload.status = 'scheduled';
        // Set publish_at to the future date selected by the user
        updatePayload.publish_at = scheduleDate.toISOString();
    }

    console.log("Sending payload to DB:", updatePayload);

    // 3. SEND TO SUPABASE
    try {
        const { error } = await supabase
            .from('events')
            .update(updatePayload)
            .eq('id', eventId); // Update the specific draft event

        if (error) throw error;

        Alert.alert(
            "Success", 
            publishOption === 'now' ? "Your event is Live!" : "Your event has been scheduled.",
            [{ text: "OK", onPress: () => navigation.popToTop() }] // Go back home
        );

    } catch (error:any) {
        Alert.alert("Error", error.message || "Could not publish event.");
        console.error(error);
    } finally {
        setLoading(false);
    }
};




     
  

      useEffect(() => {
        if (category === 'islamic_history') {
          setSubCategoryData([
            { label: 'Seerah', value: 'seerah' },
            { label: 'Golden Age', value: 'golden_age' }
          ]);
        } else if (category === 'tech') {
          setSubCategoryData([
            { label: 'AI & ML', value: 'ai' },
            { label: 'Blockchain', value: 'blockchain' }
          ]);
        } else {
          setSubCategoryData([]);
          setSubcategory(null);
        }
      }, [category]);


    
      const formatDate= (dateString: string | number | Date) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        };
        return date.toLocaleString('en-US', options);
      }
  


    const RadioButton: React.FC<{ label: string; value: string; selectedValue: string; onSelect: (val: string) => void }> = ({ label, value, selectedValue, onSelect }) => {
          return (
            <TouchableOpacity style={styles.radioContainer} onPress={() => onSelect(value)}>
              <View style={[styles.radioCircle, selectedValue === value && styles.radioCircleSelected]}>
                {selectedValue === value && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.radioLabel}>{label}</Text>
            </TouchableOpacity>
          );
        }

  return (
       <SafeAreaView style={styles.safeArea}>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.topHeaderMsg}>You're almost ready to go live</Text>

          <View style={styles.summaryContainer}>
         
              {previewImage ? (
                <Image source={{ uri: previewImage }} style={styles.summaryImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.placeholderText}>No image uploaded</Text>
                </View>
              )}

          <Text style={styles.eventName}>{previewTitle}</Text>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={20} color="#007BFF" />
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </View>

          <TouchableOpacity style={styles.previewButton}>
            <Text style={styles.previewButtonText}>Preview Event Page</Text>
          </TouchableOpacity>

          <View style={styles.creatorBox}>
              <Text style={styles.creatorLabel}>Created by</Text>
              <Text style={styles.creatorName}>{creatorName}</Text>
          </View>
          </View>

                  <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Publish Settings</Text>
          <Text style={styles.sectionDesc}>Set how and when this event is happening</Text>

          <Text style={styles.fieldLabel}>When should we publish the event?</Text>

          <RadioButton
            label="Publish Now"
            value="now"
            selectedValue={publishOption}
            onSelect={setPublishOption}
          />
          <RadioButton
            label="Schedule for later"
            value="later"
            selectedValue={publishOption}
            onSelect={setPublishOption}
          />

                    {publishOption === 'later' && (
            <View style={{marginTop: 10}}>
              <TouchableOpacity
                 style={styles.datePickerButton}
                 onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
               
              >
                 <Text style={styles.datePickerText}>
                   {scheduleDate.toLocaleDateString()} at {scheduleDate.toLocaleTimeString()}
                 </Text>
                 <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

                       

                {/* Replace the old DateTimePicker block with this */}
                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="datetime"
                  onConfirm={(date) => {
                    // This runs when user taps "OK"
                    setScheduleDate(date);
                    setShowDatePicker(false); // Hide the modal
                  }}
                  onCancel={() => {
                    // This runs when user taps "Cancel" or outside
                    setShowDatePicker(false); // Hide the modal
                  }}
                  // It handles Android quirks automatically!
                />
              

           
            </View>
          )}

          <Text style={styles.fieldLabelWithMargin}>Redirect URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://your-website.com/thank-you"
            value={redirectUrl}
            onChangeText={setRedirectUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          </View>

                <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Search Settings</Text>
          <Text style={styles.sectionDesc}>Help users find your event easily</Text>

                    <View style={styles.dropdownRow}></View>

                <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: '#007BFF' }, errors.category && { borderColor: 'red' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={categoryData}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Category' : '...'}
                value={category}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setCategory(item.value);
                    setIsFocus(false);
                    if (errors.category) setErrors({...errors, category: ''});
                }}
                />
                <ErrorText error={errors.category} />
            </View>

                         {/* Subcategory */}
            <View style={{flex: 1}}>
                <Text style={styles.fieldLabel}>Subcategory</Text>
                 <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: '#007BFF' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={subCategoryData} // Uses dependent data
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Select Sub...'}
                value={subcategory}
                disable={!category || subCategoryData.length === 0} // Disable if no parent selected
                onChange={item => {
                    setSubcategory(item.value);
                }}
                />
            </View>
          </View>

                   <Text style={styles.fieldLabelWithMargin}>Tags (separate with commas)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="e.g. conference, workshop, 2024"
            value={tags}
            onChangeText={setTags}
            multiline={true}
          />
         
          <View style={{height: 80}} />

       </ScrollView>

             <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishButtonText}>Publish Event</Text>
        </TouchableOpacity>
      </View>


       </SafeAreaView>

  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20 },
  topHeaderMsg: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15, textAlign: 'center' },

  // --- Summary Container Styles ---
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 15, resizeMode: 'cover' },
  placeholderImage: {
    width: '100%', height: 180, backgroundColor: '#e9ecef', borderRadius: 8,
    marginBottom: 15, justifyContent: 'center', alignItems: 'center'
  },
  placeholderText: { color: '#888', marginTop: 8, fontSize: 16 },
  eventName: { fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dateText: { fontSize: 16, color: '#555', marginLeft: 8 },
  previewButton: {
    backgroundColor: '#E6F0FF', // Light blue bg
    paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, marginBottom: 15, width: '100%', alignItems: 'center'
  },
  previewButtonText: { color: '#007BFF', fontWeight: '600' },
  creatorBox: { alignItems: 'center' },
  creatorLabel: { fontSize: 12, color: '#888' },
  creatorName: { fontSize: 16, fontWeight: '500', color: '#333' },

  // --- Section Styles ---
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  sectionDesc: { fontSize: 14, color: '#666', marginBottom: 20 },
  fieldLabel: { fontSize: 15, fontWeight: '500', color: '#444', marginBottom: 8 },
  fieldLabelWithMargin: { fontSize: 15, fontWeight: '500', color: '#444', marginBottom: 8, marginTop: 15 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa'
  },

  // --- Radio Button Styles ---
  radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radioCircle: {
    height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: '#007BFF',
    alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
  radioCircleSelected: { borderColor: '#007BFF' },
  radioInnerCircle: { height: 12, width: 12, borderRadius: 6, backgroundColor: '#007BFF' },
  radioLabel: { fontSize: 16, color: '#333' },

  // --- Date Picker Styles ---
  datePickerButton: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fafafa'
  },
  datePickerText: { fontSize: 16, color: '#333' },

  // --- Dropdown Styles ---
  dropdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dropdown: {
    height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 8, backgroundColor: '#fafafa'
  },
  placeholderStyle: { fontSize: 14, color: '#999' },
  selectedTextStyle: { fontSize: 14, color: '#333' },


  // --- Footer Styles ---
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', flexDirection: 'row', padding: 15,
    borderTopWidth: 1, borderTopColor: '#eee', elevation: 10
  },
  backButton: {
    flex: 1, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8,
    alignItems: 'center', marginRight: 10
  },
  backButtonText: { color: '#333', fontWeight: '600', fontSize: 16 },
  publishButton: {
    flex: 2, backgroundColor: '#007BFF', padding: 15, borderRadius: 8,
    alignItems: 'center'
  },
  publishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});


