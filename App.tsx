
import { ref, onMounted, computed } from 'vue';
import { marked } from 'marked';
import { fetchProfile, fetchArticles, fetchArticleDetail } from './services/api';
import { UserProfile, ArticleSummary, ArticleDetail } from './types';

export default {
  name: 'App',
  setup() {
    // --- State ---
    const loading = ref(true);
    const error = ref<string | null>(null);
    const profile = ref<UserProfile | null>(null);
    const articles = ref<ArticleSummary[]>([]);
    const isDarkMode = ref(true);
    const isCopied = ref(false);
    
    // Navigation State
    const view = ref<'list' | 'detail'>('list');
    const currentArticle = ref<ArticleDetail | null>(null);

    // --- Computed ---
    const renderedMarkdown = computed(() => {
      return currentArticle.value?.content ? marked.parse(currentArticle.value.content) : '';
    });

    // --- Actions ---
    const init = async () => {
      // Initialize Theme based on local storage or default to dark
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        isDarkMode.value = false;
        document.body.classList.add('light-mode');
      }

      error.value = null;
      try {
        const [p, a] = await Promise.all([fetchProfile(), fetchArticles()]);
        profile.value = p;
        articles.value = a;
      } catch (e) {
        error.value = 'Failed to load data. Please try again later.';
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      if (isDarkMode.value) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
    };

    const copyEmail = async () => {
      if (!profile.value?.email) return;
      try {
        await navigator.clipboard.writeText(profile.value.email);
        isCopied.value = true;
        setTimeout(() => (isCopied.value = false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    };

    const viewArticle = async (id: string) => {
      loading.value = true;
      error.value = null;
      try {
        const detail = await fetchArticleDetail(id);
        if (detail) {
          currentArticle.value = detail;
          view.value = 'detail';
          window.scrollTo(0, 0);
        }
      } catch (e) {
        error.value = 'Failed to load article. Please try again later.';
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const backToList = () => {
      view.value = 'list';
      currentArticle.value = null;
    };

    onMounted(init);

    return {
      profile,
      articles,
      loading,
      error,
      view,
      isDarkMode,
      toggleTheme,
      copyEmail,
      isCopied,
      currentArticle,
      renderedMarkdown,
      viewArticle,
      backToList
    };
  },
  template: `
    <div class="min-h-screen max-w-3xl mx-auto px-6 py-10 flex flex-col transition-colors duration-300">
      
      <!-- Theme Toggle (Top Right) -->
      <div class="flex justify-end mb-6">
        <button 
          @click="toggleTheme" 
          class="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--muted-color)] hover:text-[var(--text-color)]"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <i v-if="isDarkMode" class="ph-fill ph-sun text-xl"></i>
          <i v-else class="ph-fill ph-moon text-xl"></i>
        </button>
      </div>

      <!-- Header Section -->
      <header class="mb-12 flex flex-row items-start gap-6 pb-8 border-b border-[var(--border-color)]">
        <div v-if="loading && !profile" class="text-sm text-[var(--muted-color)]">
          Loading...
        </div>
        <template v-else>
          <!-- Avatar -->
          <img 
            :src="profile?.avatarUrl" 
            class="w-24 h-24 rounded-lg bg-[var(--bg-color)]"
            alt="avatar"
          />
          
          <div class="flex flex-col pt-1">
            <h1 class="text-xl font-bold mb-2 tracking-tight text-[var(--heading-color)]">
              {{ profile?.username }}
            </h1>
            <p class="text-sm text-[var(--muted-color)] mb-3">
              {{ profile?.bio }}
            </p>
            
            <!-- Email Copy Section -->
            <div 
              v-if="profile?.email"
              @click="copyEmail"
              class="inline-flex items-center gap-2 text-xs cursor-pointer group select-none w-fit"
            >
              <i class="ph-bold ph-envelope-simple text-[var(--muted-color)] group-hover:text-[var(--link-color)]"></i>
              <span class="text-[var(--text-color)] border-b border-dashed border-[var(--muted-color)] group-hover:border-[var(--link-color)] group-hover:text-[var(--link-color)] transition-colors">
                {{ profile.email }}
              </span>
              <span 
                class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all duration-200"
                :class="isCopied ? 'bg-green-900/30 text-green-500' : 'opacity-0 group-hover:opacity-100 text-[var(--muted-color)] bg-[var(--hover-bg)]'"
              >
                {{ isCopied ? 'COPIED!' : 'COPY' }}
              </span>
            </div>
          </div>
        </template>
      </header>

      <!-- Main Content Area -->
      <main class="flex-grow">
        
        <div v-if="loading" class="text-center text-[var(--muted-color)] my-10">
          Loading data...
        </div>

        <div v-if="error" class="text-center text-red-500 my-10">
          {{ error }}
        </div>

        <!-- Article List View -->
        <div v-if="!loading && view === 'list'" class="animate-fade-in">
          <div class="flex items-center justify-between mb-4 text-xs font-bold text-[var(--muted-color)] uppercase tracking-wider">
            <span>Date</span>
            <span>File Name</span>
          </div>
          
          <ul class="space-y-1">
            <li v-for="item in articles" :key="item.id">
              <button 
                @click="viewArticle(item.id)"
                class="w-full flex justify-between items-baseline text-left py-3 px-3 -mx-3 rounded-md hover:bg-[var(--hover-bg)] transition-colors group"
              >
                <span class="text-sm text-[var(--muted-color)] w-32 shrink-0 font-mono">{{ item.publishDate }}</span>
                <span class="text-base font-medium text-[var(--text-color)] group-hover:text-[var(--link-color)] transition-colors">
                  {{ item.title }}
                </span>
              </button>
            </li>
          </ul>
          
          <div v-if="articles.length === 0" class="text-center text-[var(--muted-color)] mt-10">
            No articles found.
          </div>
        </div>

        <!-- Article Detail View -->
        <div v-if="!loading && view === 'detail'" class="animate-fade-in">
          <button 
            @click="backToList"
            class="mb-6 text-sm text-[var(--muted-color)] hover:text-[var(--text-color)] flex items-center gap-1 transition-colors"
          >
            <i class="ph-bold ph-arrow-left"></i> Back
          </button>

          <article>
            <div class="mb-8 border-b border-[var(--border-color)] pb-4">
              <h1 class="text-3xl font-bold mb-2 text-[var(--heading-color)]">{{ currentArticle?.title }}</h1>
              <div class="text-sm text-[var(--muted-color)] font-mono">
                {{ currentArticle?.publishDate }}
              </div>
            </div>
            
            <div class="markdown-body" v-html="renderedMarkdown"></div>
          </article>

          <div class="mt-16 pt-8 border-t border-[var(--border-color)] text-center">
            <button @click="backToList" class="text-sm text-[var(--muted-color)] hover:text-[var(--text-color)] hover:underline">
              End of File
            </button>
          </div>
        </div>

      </main>

      <footer class="mt-20 pt-6 border-t border-[var(--border-color)] flex justify-between text-xs text-[var(--muted-color)]">
        <p>&copy; {{ new Date().getFullYear() }} {{ profile?.username }}</p>
        <p>v1.0.0</p>
      </footer>

    </div>
  `
};
