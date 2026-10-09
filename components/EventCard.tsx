import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EventCard = ({ event, onPress, currentUserId }: any) => {
  const {
    id,
    title,
    image_url,
    start_date,
    is_online,
    is_physical,
    location_details,
    is_paid,
    tickets,
  } = event;

  // --- NEW: State for Likes ---
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Fetch initial like data when card loads
  useEffect(() => {
    fetchLikeData();
  }, [id, currentUserId]);

  const fetchLikeData = async () => {
    // 1. Get total likes for this event
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id);

    setLikeCount(count || 0);

    // 2. Check if the current user has liked it
    if (currentUserId) {
      const { data } = await supabase
        .from("likes")
        .select("user_id")
        .eq("event_id", id)
        .eq("user_id", currentUserId)
        .single();

      if (data) setIsLiked(true);
    }
  };

  const handleLikeToggle = async () => {
    if (!currentUserId) return alert("Please log in to like events.");

    // OPTIMISTIC UPDATE: Change UI instantly
    const previouslyLiked = isLiked;
    setIsLiked(!previouslyLiked);
    setLikeCount((prev) => (previouslyLiked ? prev - 1 : prev + 1));

    try {
      if (!previouslyLiked) {
        // Add like
        const { error } = await supabase
          .from("likes")
          .insert({ event_id: id, user_id: currentUserId });
        if (error) throw error;
      } else {
        // Remove like
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("event_id", id)
          .eq("user_id", currentUserId);
        if (error) throw error;
      }
    } catch (error) {
      // If database fails, revert the UI back to how it was
      console.log("Error toggling like:", error);
      setIsLiked(previouslyLiked);
      setLikeCount((prev) => (previouslyLiked ? prev + 1 : prev - 1));
    }
  };

  const formatEventDate = (isoString: string) => {
    if (!isoString) return "Date TBD";
    try {
      return format(parseISO(isoString), "EEE, MMM d • h:mm a");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getPriceText = () => {
    if (!is_paid || !tickets || tickets.length === 0) {
      return <Text style={[styles.priceText, { color: "green" }]}>Free</Text>;
    }
    const prices = tickets.map((t: { price: any }) => Number(t.price));
    const minPrice = Math.min(...prices);
    return (
      <Text style={styles.priceText}>From ₦{minPrice.toLocaleString()}</Text>
    );
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* 1. Top Half: Image Banner */}
      <Image
        source={
          image_url
            ? { uri: image_url }
            : { uri: "https://via.placeholder.com/400x200?text=No+Image" }
        }
        style={styles.bannerImage}
        resizeMode="cover"
      />

      {is_online && !is_physical && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Online</Text>
        </View>
      )}
      {!is_online && is_physical && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Physical</Text>
        </View>
      )}
      {is_online && is_physical && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Hybrid</Text>
        </View>
      )}

      {/* 2. Bottom Half: Details Area */}
      <View style={styles.detailsContainer}>
        <Text style={styles.dateText}>{formatEventDate(start_date)}</Text>
        <Text style={styles.titleText} numberOfLines={2}>
          {title}
        </Text>

        {is_online && (
          <View style={styles.locationRow}>
            <Ionicons
              name="videocam-outline"
              size={16}
              color="#666"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.locationText}>
              {location_details?.platform}
            </Text>
          </View>
        )}

        {is_physical && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#666"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.locationText}>{location_details?.address}</Text>
          </View>
        )}

        {/* 3. The Action Row */}
        <View style={styles.actionRow}>
          {/* Left Side: Price */}
          <View style={{ justifyContent: "center" }}>{getPriceText()}</View>

          {/* Right Side: Like & Attend */}
          <View style={styles.rightActions}>
            {/* Like Button */}
            <TouchableOpacity
              style={styles.likeContainer}
              onPress={handleLikeToggle}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ff3b30" : "#666"}
              />
              <Text style={styles.likeCountText}>{likeCount}</Text>
            </TouchableOpacity>

            <View style={styles.attendButton}>
              <Text style={styles.attendButtonText}>Attend</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 2,
  },
  bannerImage: { width: "100%", height: 150 },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#6f42c1",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  detailsContainer: { padding: 15 },
  dateText: {
    fontSize: 13,
    color: "#007BFF",
    fontWeight: "600",
    marginBottom: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    lineHeight: 24,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  locationText: { fontSize: 14, color: "#666" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  priceText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  // NEW STYLES FOR LIKES
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15, // Space between heart and Attend button
  },
  likeCountText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  attendButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  attendButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default EventCard;
