import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Link } from '@react-pdf/renderer';

// Define the types based on the JSON schema
type Experience = {
  title: string;
  company: string;
  location: string;
  startMonthYear: string;
  endMonthYear: string;
  description: string[];
  technologies?: string;
};

type Education = {
  degree: string;
  institution: string;
  location: string;
  startMonthYear: string;
  endMonthYear: string;
  details?: string[];
};

export type CVTemplateProps = {
  name: string;
  title: string;
  email: string;
  location: string;
  remoteWork: boolean;
  age: string;
  summary: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  requiredYearsExperience?: number;
  recommendedKeywords?: string[];
  jobDescriptionSummary?: string;
  atsScore?: number;
  experience: Experience[];
  education: Education[];
};

// Create styles

const primaryColor = '#023e8a';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#2c3e50',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: primaryColor,
  },
  headerTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    color: '#455a64',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
    flexWrap: 'wrap',
    gap: 5,
    paddingHorizontal: 10,
    borderBottom: '1pt solid #e0e0e0',
    paddingBottom: 0,
  },
  contactItem: {
    marginHorizontal: 0,
    color: '#546e7a',
  },
  sectionTitle: {
    backgroundColor: '#f5f5f5',
    padding: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 10,
    marginTop: 10,
    marginBottom: 10,
    color: primaryColor,
    letterSpacing: 1,
  },
  bulletPoint: {
    marginLeft: 10,
    marginBottom: 4,
    color: '#37474f',
    position: 'relative',
    paddingLeft: 0,
  },
  bullet: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: '#1a237e',
  },
  experienceBlock: {
    marginBottom: 10,
    borderLeft: '2pt solid #e0e0e0',
    paddingLeft: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  jobTitle: {
    fontWeight: 'bold',
    color: primaryColor,
  },
  jobCompagny: {
    color: '#546e7a',
  },
  jobRight: {
    textAlign: 'right',
    fontSize: 9,
    color: '#546e7a',
  },
  techText: {
    fontStyle: 'italic',
    marginTop: 4,
    color: '#546e7a',
  },
  educationBlock: {
    marginBottom: 12,
    borderLeft: '2pt solid #e0e0e0',
    paddingLeft: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: primaryColor,
    textDecoration: 'underline',
  },
});

const CVTemplate: React.FC<CVTemplateProps> = ({
  name,
  title,
  email,
  location,
  remoteWork,
  age,
  summary,
  phone,
  github,
  linkedin,
  experience,
  education,
}) => (
  <Document>
  <Page size="A4" style={styles.page}>
    {/* HEADER */}
    <Text style={styles.headerName}>{name}</Text>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.contactRow}>
      <Text style={styles.contactItem}>{location}</Text>
      <Text style={{marginHorizontal: 1}}>|</Text>
      <Text style={styles.contactItem}>{email}</Text>
      <Text style={{marginHorizontal: 1}}>|</Text>
      {github && <Link style={styles.contactItem} src={github}>GitHub</Link>}
      <Text style={{marginHorizontal: 1}}>|</Text>
      {linkedin && <Link style={styles.contactItem} src={linkedin}>LinkedIn</Link>}
      <Text style={{marginHorizontal: 1}}>|</Text>
      {phone && <Text style={styles.contactItem}>{phone}</Text>}
    </View>

    {/* ABOUT ME */}
    <Text style={styles.sectionTitle}>ABOUT ME</Text>
    <View>
      {summary.split('\n').map((line, i) => (
        <Text key={i} style={styles.bulletPoint}>
          {line}
        </Text>
      ))}
    </View>

    {/* EXPERIENCE */}
    <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
    {experience.map((exp, idx) => (
      <View key={idx} style={styles.experienceBlock}>
        <View style={styles.jobHeader}>
          <View style={{ flex: 3 }}>
            <Text style={styles.jobTitle}>{exp.title}</Text>
            <Text style={styles.jobCompagny}>{exp.company}</Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={styles.jobRight}>
              {exp.startMonthYear} - {exp.endMonthYear}
            </Text>
            <Text style={styles.jobRight}>{exp.location}</Text>
          </View>
        </View>
        <View style={{ marginTop: 2 }}>
          {exp.description.map((desc, i) => (
            <Text key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text> {desc}
            </Text>
          ))}
          {exp.technologies && (
            <Text style={styles.techText}>
              <Text style={styles.bold}>Technologies: </Text>
              {exp.technologies}
            </Text>
          )}
        </View>
      </View>
    ))}

    {/* EDUCATION */}
    <Text style={styles.sectionTitle}>EDUCATION</Text>
    {education.map((edu, idx) => (
      <View key={idx} style={styles.educationBlock}>
        <View style={styles.jobHeader}>
          <View style={{ flex: 3 }}>
            <Text style={styles.bold}>{edu.degree}</Text>
            <Text>{edu.institution}</Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={styles.jobRight}>
              {edu.startMonthYear} - {edu.endMonthYear}
            </Text>
            <Text style={styles.jobRight}>{edu.location}</Text>
          </View>
        </View>
        {edu.details &&
          edu.details.map((line, i) => (
            <Text key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text> {line}
            </Text>
          ))}
      </View>
    ))}
  </Page>
</Document>
);

export default CVTemplate;
