export type Language = "he" | "en"

export const translations = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      create: "Create",
      update: "Update",
      search: "Search",
      filter: "Filter",
      all: "All",
      loading: "Loading...",
      noResults: "No results found",
    },
    project: {
      title: "Projects",
      create: "Create Project",
      name: "Project Name",
      key: "Project Key",
      description: "Description",
      members: "Members",
      settings: "Settings",
    },
    issue: {
      title: "Issues",
      create: "Create Issue",
      titleField: "Title",
      description: "Description",
      type: "Type",
      status: "Status",
      priority: "Priority",
      assignee: "Assignee",
      reporter: "Reporter",
      created: "Created",
      updated: "Updated",
      comments: "Comments",
      subtasks: "Subtasks",
      attachments: "Attachments",
      history: "History",
      links: "Links",
      watchers: "Watchers",
      voting: "Voting",
      deleteConfirm: "Are you sure you want to delete this issue?",
    },
    subtask: {
      title: "Subtasks",
      add: "Add Subtask",
      placeholder: "Add a subtask...",
      noSubtasks: "No subtasks yet",
      completed: "completed",
      of: "of",
    },
    status: {
      backlog: "Backlog",
      todo: "To Do",
      "in-progress": "In Progress",
      "in-review": "In Review",
      done: "Done",
    },
    priority: {
      lowest: "Lowest",
      low: "Low",
      medium: "Medium",
      high: "High",
      highest: "Highest",
    },
    type: {
      task: "Task",
      bug: "Bug",
      story: "Story",
      epic: "Epic",
    },
    view: {
      board: "Board",
      list: "List",
      timeline: "Timeline",
      calendar: "Calendar",
      sprints: "Sprints",
      reports: "Reports",
    },
  },
  he: {
    common: {
      save: "שמור",
      cancel: "ביטול",
      delete: "מחק",
      edit: "ערוך",
      add: "הוסף",
      create: "צור",
      update: "עדכן",
      search: "חפש",
      filter: "סנן",
      all: "הכל",
      loading: "טוען...",
      noResults: "לא נמצאו תוצאות",
    },
    project: {
      title: "פרויקטים",
      create: "צור פרויקט",
      name: "שם הפרויקט",
      key: "מפתח פרויקט",
      description: "תיאור",
      members: "חברים",
      settings: "הגדרות",
    },
    issue: {
      title: "בעיות",
      create: "צור בעיה",
      titleField: "כותרת",
      description: "תיאור",
      type: "סוג",
      status: "סטטוס",
      priority: "עדיפות",
      assignee: "משויך",
      reporter: "מדווח",
      created: "נוצר",
      updated: "עודכן",
      comments: "תגובות",
      subtasks: "תת-משימות",
      attachments: "קבצים מצורפים",
      history: "היסטוריה",
      links: "קישורים",
      watchers: "עוקבים",
      voting: "הצבעה",
      deleteConfirm: "האם אתה בטוח שברצונך למחוק בעיה זו?",
    },
    subtask: {
      title: "תת-משימות",
      add: "הוסף תת-משימה",
      placeholder: "הוסף תת-משימה...",
      noSubtasks: "אין עדיין תת-משימות",
      completed: "הושלמו",
      of: "מתוך",
    },
    status: {
      backlog: "רשימת המתנה",
      todo: "לעשות",
      "in-progress": "בביצוע",
      "in-review": "בבדיקה",
      done: "הושלם",
    },
    priority: {
      lowest: "נמוך ביותר",
      low: "נמוך",
      medium: "בינוני",
      high: "גבוה",
      highest: "גבוה ביותר",
    },
    type: {
      task: "משימה",
      bug: "באג",
      story: "סיפור",
      epic: "אפוס",
    },
    view: {
      board: "לוח",
      list: "רשימה",
      timeline: "ציר זמן",
      calendar: "לוח שנה",
      sprints: "ספרינטים",
      reports: "דוחות",
    },
  },
} as const

export function useTranslations(lang: Language) {
  return (key: string) => {
    const keys = key.split(".")
    let value: any = translations[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }
}

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split(".")
  let value: any = translations[lang]
  for (const k of keys) {
    value = value?.[k]
  }
  return value || key
}

