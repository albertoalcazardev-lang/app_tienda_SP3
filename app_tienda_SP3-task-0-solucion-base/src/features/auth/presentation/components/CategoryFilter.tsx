import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,s
  View,
} from "react-native";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.category,
            selectedCategory === null && styles.selected,
          ]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[
              styles.text,
              selectedCategory === null && styles.selectedText,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.category,
              selectedCategory === category && styles.selected,
            ]}
            onPress={() => onSelect(category)}
          >
            <Text
              style={[
                styles.text,
                selectedCategory === category &&
                  styles.selectedText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },

  category: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#e5e5e5",
  },

  selected: {
    backgroundColor: "#222",
  },

  text: {
    fontSize: 14,
  },

  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
});