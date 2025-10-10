import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Pagină negăsită" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Această pagină nu există.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Înapoi la proiecte</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
  },
});
