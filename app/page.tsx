
"use client";

import { useEffect, useMemo, useState } from "react";
import css from "../app/Home.module.css";

// 🟩 Тип даних студента з твого Express API
type Student = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  avgMark: number;
  onDuty: boolean;
};

type StudentsResponse = {
  students: Student[];
  totalItems: number;
  page: number;
  perPage: number;
  totalPage: number;
};

export default function Home() {
  // 🟩 Стани сторінки
  const [students, setStudents] = useState<Student[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [dutyFilter, setDutyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🟩 Завантажуємо студентів із бекенду
  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`Помилка завантаження: HTTP ${response.status}`);
        }

        const data: StudentsResponse = await response.json();

        setStudents(data.students);
        setTotalItems(data.totalItems);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Сталася невідома помилка"
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  // 🟩 Пошук за іменем і фільтрація за статусом чергового
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesDuty =
        dutyFilter === "all" ||
        (dutyFilter === "yes" && student.onDuty) ||
        (dutyFilter === "no" && !student.onDuty);

      return matchesSearch && matchesDuty;
    });
  }, [students, search, dutyFilter]);

  // 🟩 Середня оцінка завантажених студентів
  const averageMark = students.length
    ? (
        students.reduce((sum, student) => sum + student.avgMark, 0) /
        students.length
      ).toFixed(1)
    : "—";

  return (
    <main className={css.page}>
      <div className={css.dashboard}>
        <header className={css.header}>
          <div>
            <p className={css.eyebrow}>STUDENT MANAGEMENT</p>
            <h1 className={css.title}>Студенти</h1>
            <p className={css.subtitle}>
              Усі важливі дані про студентів — в одному місці.
            </p>
          </div>

          <div className={css.headerBadge}>
            <span className={css.liveDot} />
            API підключено
          </div>
        </header>

        {/* 🟩 Картки статистики */}
        <section className={css.stats}>
          <article className={css.statCard}>
            <span className={css.statIcon}>👥</span>
            <p className={css.statLabel}>Усього студентів</p>
            <p className={css.statValue}>
              {loading ? "…" : totalItems}
            </p>
            <span className={css.statHint}>У базі даних</span>
          </article>

          <article className={css.statCard}>
            <span className={css.statIcon}>📚</span>
            <p className={css.statLabel}>Завантажено</p>
            <p className={css.statValue}>
              {loading ? "…" : students.length}
            </p>
            <span className={css.statHint}>На поточній сторінці API</span>
          </article>

          <article className={css.statCard}>
            <span className={css.statIcon}>⭐</span>
            <p className={css.statLabel}>Середня оцінка</p>
            <p className={css.statValue}>{loading ? "…" : averageMark}</p>
            <span className={css.statHint}>Серед завантажених</span>
          </article>

          <article className={css.statCard}>
            <span className={css.statIcon}>🟢</span>
            <p className={css.statLabel}>Чергові</p>
            <p className={css.statValue}>
              {loading
                ? "…"
                : students.filter((student) => student.onDuty).length}
            </p>
            <span className={css.statHint}>На поточній сторінці API</span>
          </article>
        </section>

        {/* 🟩 Панель пошуку та фільтра */}
        <section className={css.listSection}>
          <div className={css.listHeader}>
            <div>
              <h2 className={css.sectionTitle}>Список студентів</h2>
              <p className={css.sectionDescription}>
                Знайди студента за ім’ям або відфільтруй список.
              </p>
            </div>
            <span className={css.countBadge}>
              {loading ? "…" : filteredStudents.length} записів
            </span>
          </div>

          <div className={css.toolbar}>
            <label className={css.searchBox}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Пошук за ім’ям..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Пошук студента за ім'ям"
              />
            </label>

            <select
              className={css.filter}
              value={dutyFilter}
              onChange={(event) => setDutyFilter(event.target.value)}
              aria-label="Фільтр за статусом чергового"
            >
              <option value="all">Усі студенти</option>
              <option value="yes">Чергові</option>
              <option value="no">Не чергові</option>
            </select>
          </div>

          {loading && (
            <div className={css.message}>
              <span className={css.spinner} />
              Завантажуємо студентів...
            </div>
          )}

          {!loading && error && (
            <div className={css.error} role="alert">
              <strong>Не вдалося завантажити дані</strong>
              <p>{error}</p>
              <button
                className={css.retryButton}
                onClick={() => window.location.reload()}
              >
                Спробувати ще раз
              </button>
            </div>
          )}

          {!loading && !error && filteredStudents.length === 0 && (
            <div className={css.message}>
              Студентів за цими умовами не знайдено.
            </div>
          )}

          {/* 🟩 Таблиця студентів */}
          {!loading && !error && filteredStudents.length > 0 && (
            <div className={css.tableWrap}>
              <table className={css.table}>
                <thead>
                  <tr>
                    <th>Студент</th>
                    <th>Вік</th>
                    <th>Стать</th>
                    <th>Середній бал</th>
                    <th>Черговий</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <div className={css.studentCell}>
                          <div className={css.avatar}>
                            {student.name
                              .split(/\s+/)
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <span className={css.studentName}>
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td>{student.age} років</td>
                      <td>
                        {student.gender === "male"
                          ? "Чоловіча"
                          : student.gender === "female"
                            ? "Жіноча"
                            : student.gender}
                      </td>
                      <td>
                        <span className={css.grade}>
                          ⭐ {student.avgMark.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            student.onDuty
                              ? `${css.status} ${css.statusActive}`
                              : `${css.status} ${css.statusInactive}`
                          }
                        >
                          <span className={css.statusDot} />
                          {student.onDuty ? "Черговий" : "Ні"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className={css.tableFooter}>
            Дані отримано з Express API · MongoDB
          </footer>
        </section>
      </div>
    </main>
  );
}
