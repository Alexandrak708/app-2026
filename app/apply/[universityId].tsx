import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ApplyPage() {
  const { universityId } = useLocalSearchParams<{ universityId: string }>();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [program, setProgram] = useState("");
  const [statement, setStatement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return "Full name is required";
    if (!currentSchool.trim()) return "Current school is required";
    if (!program.trim()) return "Program is required";
    if (!statement.trim() || statement.trim().length < 20) return "Personal statement must be at least 20 characters";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Validation error", err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/apply/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId,
          fullName,
          currentSchool,
          program,
          statement,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      const json = await res.json();
      Alert.alert("Application queued", json.message || "Your application was received.");
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      Alert.alert("Submit failed", e?.message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>Apply — University</Text>
      <Text style={{ color: "#475569", marginBottom: 12 }}>University ID: {universityId}</Text>

      <Text style={{ marginBottom: 6, fontWeight: "700" }}>Full name</Text>
      <TextInput value={fullName} onChangeText={setFullName} placeholder="Your full name" style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 8, marginBottom: 12 }} />

      <Text style={{ marginBottom: 6, fontWeight: "700" }}>Current school / university</Text>
      <TextInput value={currentSchool} onChangeText={setCurrentSchool} placeholder="Your current school" style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 8, marginBottom: 12 }} />

      <Text style={{ marginBottom: 6, fontWeight: "700" }}>Program applying for</Text>
      <TextInput value={program} onChangeText={setProgram} placeholder="Program name" style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 8, marginBottom: 12 }} />

      <Text style={{ marginBottom: 6, fontWeight: "700" }}>Personal statement (3–5 sentences)</Text>
      <TextInput
        value={statement}
        onChangeText={setStatement}
        placeholder="Introduce yourself and why you're applying"
        multiline
        numberOfLines={5}
        style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 8, marginBottom: 12, textAlignVertical: "top" }}
      />

      <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ backgroundColor: "#0f172a", padding: 14, borderRadius: 10, alignItems: "center" }}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Submit application</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

