// src/api/marketingApi.js
import { request } from './apiClient';

export const marketingApi = {
  // --- SLIDERS ---
  async getSliders() {
    try {
      const res = await request('/marketing/sliders');
      return res.data || [];
    } catch {
      // Fallback to public if token not yet set or testing
      try {
        const res = await request('/public/landing/sliders');
        return res.data || [];
      } catch {
        return [
          {
            id: 1,
            title: 'Tingkatkan Kemampuan Bahasa Asing Anda',
            subtitle: 'Kursus intensif bahasa Inggris, Jepang, Korea, dan lainnya di LBI FIB UI',
            image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
            cta_text: 'Daftar Sekarang',
            cta_link: '/schedules',
            sort_order: 1,
            is_active: 1
          },
          {
            id: 2,
            title: 'Program BIPA (Bahasa Indonesia untuk Penutur Asing)',
            subtitle: 'Pelajari bahasa dan budaya Indonesia secara langsung dari universitas terkemuka',
            image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
            cta_text: 'Jelajahi BIPA',
            cta_link: '/bipa',
            sort_order: 2,
            is_active: 1
          }
        ];
      }
    }
  },

  async createSlider(formData) {
    return await request('/marketing/sliders', {
      method: 'POST',
      body: formData
    });
  },

  async getSlider(id) {
    const res = await request(`/marketing/sliders/${id}`);
    return res.data || null;
  },

  async updateSlider(id, formData) {
    // For Laravel multipart PUT, we can use POST with _method=PUT or JSON if no file
    const isFormData = formData instanceof FormData;
    if (isFormData && !formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    return await request(`/marketing/sliders/${id}`, {
      method: 'POST',
      body: formData
    });
  },

  async deleteSlider(id) {
    return await request(`/marketing/sliders/${id}`, {
      method: 'DELETE'
    });
  },

  // --- BANNERS ---
  async getBanners() {
    try {
      const res = await request('/marketing/banners');
      return res.data || [];
    } catch {
      try {
        const res = await request('/public/landing/banners');
        return res.data || [];
      } catch {
        return [
          {
            id: 1,
            title: 'Pendaftaran Semester Gasal 2026/2027 Telah Dibuka!',
            category: 'promo',
            description: 'Dapatkan diskon early bird 15% untuk pendaftaran sebelum 30 September 2026.',
            image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
            link_url: '/schedules',
            is_active: 1
          },
          {
            id: 2,
            title: 'Tes Kemampuan Bahasa Asing (EPT / JLPT Prep)',
            category: 'announcement',
            description: 'Jadwal tes diagnostik dan sertifikasi resmi periode bulan ini.',
            image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
            link_url: '/services/ppb',
            is_active: 1
          }
        ];
      }
    }
  },

  async createBanner(formData) {
    return await request('/marketing/banners', {
      method: 'POST',
      body: formData
    });
  },

  async getBanner(id) {
    const res = await request(`/marketing/banners/${id}`);
    return res.data || null;
  },

  async updateBanner(id, formData) {
    const isFormData = formData instanceof FormData;
    if (isFormData && !formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    return await request(`/marketing/banners/${id}`, {
      method: 'POST',
      body: formData
    });
  },

  async deleteBanner(id) {
    return await request(`/marketing/banners/${id}`, {
      method: 'DELETE'
    });
  },

  // --- POSTS / BLOG ---
  async getPosts(page = 1) {
    try {
      const res = await request(`/marketing/posts?page=${page}`);
      return res.data || [];
    } catch {
      try {
        const res = await request(`/public/posts?page=${page}`);
        return res.data || [];
      } catch {
        return [
          {
            id: 1,
            title: 'Tips Sukses Mempelajari Bahasa Baru dalam 3 Bulan',
            slug: 'tips-sukses-belajar-bahasa-baru',
            category: 'Tips & Panduan',
            summary: 'Kunci konsistensi dan metode belajar berbasis imersi untuk hasil maksimal.',
            body: 'Mempelajari bahasa asing membutuhkan komitmen dan teknik yang tepat...',
            featured_image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
            is_published: 1,
            created_at: '2026-09-01T10:00:00Z',
            author: { name: 'Tim Marketing LBI' }
          },
          {
            id: 2,
            title: 'Kenalkan Budaya Indonesia Melalui Program BIPA',
            slug: 'kenali-budaya-indonesia-bipa',
            category: 'Program BIPA',
            summary: 'Bagaimana mahasiswa mancanegara mengenal keragaman suku dan bahasa nusantara.',
            body: 'Program Bahasa Indonesia bagi Penutur Asing (BIPA) FIB UI telah melatih ratusan ekspatriat...',
            featured_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
            is_published: 1,
            created_at: '2026-09-05T14:30:00Z',
            author: { name: 'Content Writer' }
          }
        ];
      }
    }
  },

  async getPost(id) {
    const res = await request(`/marketing/posts/${id}`);
    return res.data || null;
  },

  async createPost(formData) {
    return await request('/marketing/posts', {
      method: 'POST',
      body: formData
    });
  },

  async updatePost(id, formData) {
    const isFormData = formData instanceof FormData;
    if (isFormData && !formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    return await request(`/marketing/posts/${id}`, {
      method: 'POST',
      body: formData
    });
  },

  async deletePost(id) {
    return await request(`/marketing/posts/${id}`, {
      method: 'DELETE'
    });
  },

  // --- PARTNERS ---
  async getPartners() {
    try {
      const res = await request('/marketing/partners');
      return res.data || [];
    } catch {
      try {
        const res = await request('/public/landing/partners');
        return res.data || [];
      } catch {
        return [
          {
            id: 1,
            name: 'Kedutaan Besar Jepang (Japan Foundation)',
            logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80',
            website_url: 'https://jpf.or.id'
          },
          {
            id: 2,
            name: 'Institut Français d’Indonésie (IFI)',
            logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
            website_url: 'https://ifi-id.com'
          },
          {
            id: 3,
            name: 'Goethe-Institut Indonesien',
            logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
            website_url: 'https://goethe.de/ins/id'
          }
        ];
      }
    }
  },

  async createPartner(formData) {
    return await request('/marketing/partners', {
      method: 'POST',
      body: formData
    });
  },

  async getPartner(id) {
    const res = await request(`/marketing/partners/${id}`);
    return res.data || null;
  },

  async updatePartner(id, formData) {
    const isFormData = formData instanceof FormData;
    if (isFormData && !formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    return await request(`/marketing/partners/${id}`, {
      method: 'POST',
      body: formData
    });
  },

  async deletePartner(id) {
    return await request(`/marketing/partners/${id}`, {
      method: 'DELETE'
    });
  },

  async getServices() {
    const res = await request('/marketing/services');
    return res.data || [];
  },

  async getService(id) {
    const res = await request(`/marketing/services/${id}`);
    return res.data || null;
  },

  async updateService(id, data) {
    const isFormData = data instanceof FormData;
    if (isFormData && !data.has('_method')) data.append('_method', 'PUT');
    return await request(`/marketing/services/${id}`, {
      method: isFormData ? 'POST' : 'PUT',
      body: isFormData ? data : JSON.stringify(data)
    });
  },

  async uploadContentImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return await request('/marketing/content-images', {
      method: 'POST',
      body: formData
    });
  },

  async getCourseCatalogs() {
    const res = await request('/marketing/course-catalogs');
    return res.data || [];
  },

  async getCourseCatalog(id) {
    const res = await request(`/marketing/course-catalogs/${id}`);
    return res.data || null;
  },

  async createCourseCatalog(data) {
    return await request('/marketing/course-catalogs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCourseCatalog(id, data) {
    return await request(`/marketing/course-catalogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteCourseCatalog(id) {
    return await request(`/marketing/course-catalogs/${id}`, {
      method: 'DELETE'
    });
  }
};
