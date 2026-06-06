# ScheduleCraft 🗓️

**ScheduleCraft** is an interactive, algorithm-driven full-stack class scheduling application. It helps students solve the tedious "course scheduling puzzle" by automatically generating conflict-free calendar layouts from selected courses and dynamic personal constraints.

Built using **Next.js (App Router)**, **TypeScript**, and **Vanilla CSS**, the app runs a recursive backtracking depth-first search (DFS) solver on the backend, making it a standout project for a computer science portfolio.

---

## 🚀 Key Features

* **Live Course Catalog**: Search, filter, and add courses from a simulated catalog with pre-defined sections, credits, and timeslots.
* **Dynamic Constraints Engine**: Toggle preferences such as:
  * **Avoid Fridays**: Automatically filter out sections scheduled on Fridays.
  * **Avoid Early 8 AMs**: Eliminate sections starting before 9:00 AM.
  * **Max Classes per Day**: Cap the maximum daily class count.
  * **Max Back-to-Back Hours**: Set boundaries on consecutive lecture hours without a break.
* **Precise 3D-Like Calendar Grid**: Render schedules dynamically in a weekly hourly grid (8:00 AM - 6:00 PM) with color-coded department cards.
* **Performance Metrics Badge**: View solver execution times and the count of combinations searched (e.g., *"Solved in 12ms / 340 combinations checked"*).
* **Saved Schedules Directory**: Name, save, and delete layout configurations. Saved layouts persist in a local database and can be loaded back onto the calendar with a single click.

---

## 🧠 The Algorithm (Constraint Satisfaction)

At the heart of ScheduleCraft is a **Recursive Backtracking Solver** modeled after Constraint Satisfaction Problems (CSP).

### How it Works:
1. **Decision Tree**: The solver constructs a tree where each level represents a selected course, and each branch from that node represents a specific class section.
2. **Conflict Checking**: Before adding a section to the schedule, the algorithm checks:
   * **Time Overlaps**: Two timeslots on the same day overlap if:
     $$\text{Start}_A < \text{End}_B \quad \text{and} \quad \text{Start}_B < \text{End}_A$$
   * **User Constraints**: Check if the configuration satisfies rules like "No Fridays" or "Max consecutive hours".
3. **Pruning & Backtracking**: If a conflict is found, the solver **prunes** that branch (skips further deep checks) and **backtracks** (removes the last section and tries the next branch).
4. **Base Case**: If all courses are successfully assigned a valid section, the arrangement is saved as a complete schedule solution.

```typescript
function backtrack(courseIndex: number, currentSchedule: Section[]) {
  // Base case: All selected courses scheduled successfully
  if (courseIndex === selectedCourses.length) {
    results.push([...currentSchedule]);
    return;
  }

  const course = selectedCourses[courseIndex];
  for (const section of course.sections) {
    if (!doesSectionOverlap(section, currentSchedule) && 
        satisfiesConstraints(section, currentSchedule, constraints)) {
      
      // Choose
      currentSchedule.push(section);
      
      // Explore
      backtrack(courseIndex + 1, currentSchedule);
      
      // Unchoose (Backtrack)
      currentSchedule.pop();
    }
  }
}
```

---

## 🛠️ Technology Stack

* **Frontend**: Next.js React Components, Lucide Icons, Vanilla CSS (Modern CSS grid, absolute coordinate mapping, glassmorphism UI).
* **Backend**: Next.js API Routes (`/api/courses`, `/api/solve`, `/api/saved`).
* **Database**: Lightweight file-based JSON DB controller for storing saved schedules.
* **Language**: Strict TypeScript for clean interfaces and types.

---

## 📦 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (recommended version 18+).

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/saiyash07/ScheduleCraft.git
   cd ScheduleCraft
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *(If port 3000 is occupied, you can run the server on a custom port)*:
   ```bash
   npm run dev -- -p 3080
   ```

4. Open **`http://localhost:3080`** (or your selected port) in your browser.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
