import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FONTS } from '../utils/constants';

interface WordHighlighterProps {
  words: string[];
  currentWordIndex: number;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  highlightColor: string;
  textColor: string;
}

export function WordHighlighter({
  words,
  currentWordIndex,
  fontSize,
  letterSpacing,
  lineHeight,
  highlightColor,
  textColor,
}: WordHighlighterProps) {
  return (
    <Text style={[styles.container, { lineHeight }]}>
      {words.map((word, index) => (
        <Text
          key={index}
          style={[
            styles.word,
            { fontSize, letterSpacing, color: textColor },
            index === currentWordIndex && {
              backgroundColor: highlightColor,
              borderRadius: 4,
            },
          ]}
        >
          {word}{index < words.length - 1 ? ' ' : ''}
        </Text>
      ))}
    </Text>
  );
}

export default WordHighlighter;

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
  },
  word: {
    fontFamily: FONTS.regular,
  },
});
