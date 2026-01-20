import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { supabase } from './lib/supabase';

export default function PublishEvent({route}:any) {
   const navigation = useNavigation<any>();
   // const { requestId } = route.params;
    //const params = useLocalSearchParams();
  const { eventId, previewImage, previewTitle } = route.params;
    const[isPublished, setIsPublished]=React.useState(false)
    const[isDraft, setIsDraft]=React.useState(false)
    const[isPrivate, setIsPrivate]=React.useState(false)
    const[publishDate, setPublishDate]=React.useState(null)
    const[redirectUrl,setRedirectUrl]=useState(null)
    const[category, setCategory]=useState(null)
    const[subCategory,setSubCategory]=useState(null)
    const[tags, setTags]=useState<[]|null>(null)
    const [loading, setLoading] = useState(false);

    const categories = [
    { label: 'Technology', value: 'tech' },
    { label: 'Music', value: 'music' },
    { label: 'Business', value: 'business' },
    { label: 'Religious', value: 'religious' },
  ];

  const handlePublish = async () => {
    if (!category) return alert("Please select a category");

    setLoading(true);
    
    // 3. UPDATE THE EXISTING RECORD
    const { error } = await supabase
      .from('events')
      .update({ 
        category: category,
        redirect_url: redirectUrl,
        status: 'published' // <--- The Magic Switch
      })
      .eq('id', eventId); // Find event by the ID we passed

    setLoading(false);

    if (error) {
      Alert.alert("Error", "Could not publish event.");
    } else {
      Alert.alert("Success!", "Your event is now Live.");
      navigation.popToTop(); // Go back to Home
    }
  };
  return (
    <View>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>Preview</Text>
      <View style={{flexDirection: 'row', marginBottom: 30, backgroundColor: '#eee', padding: 10, borderRadius: 8}}>
        <Image source={{ uri: previewImage }} style={{width: 80, height: 80, borderRadius: 8}} />
        <View style={{marginLeft: 15, justifyContent: 'center'}}>
           <Text style={{fontWeight: 'bold', fontSize: 16}}>{previewTitle}</Text>
           <Text style={{color: 'gray'}}>Status: Draft</Text>
        </View>
      </View>
    </View>
  )
}