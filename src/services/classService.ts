import { supabase } from '../lib/supabase';
import { BrailleClass, Chapter } from '../types/classTypes';

export const ClassService = {
  async createClass(
    classData: Omit<BrailleClass, 'id' | 'createdAt' | 'updatedAt' | 'enrolledStudents'>,
    imageFile?: File
  ): Promise<{ data: BrailleClass | null; error: any }> {
    try {
      let image_url = classData.imageUrl || '/braille-pattern.svg';
      
      // Upload image if provided
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `class-images/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('class-images')
            .upload(filePath, imageFile);
            
          if (uploadError) {
            console.error('Image upload error:', uploadError);
            // Continue with default image if upload fails
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('class-images')
              .getPublicUrl(filePath);
            
            image_url = publicUrl;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with default image if upload fails
        }
      }
      
      // Prepare the class data
      const dbClassData = {
        // Allow null creator_id for anonymous classes
        creator_id: classData.creatorId,
        title: classData.title,
        description: classData.description,
        image_url,
        meeting_link: classData.meetingLink || '',
        schedule: classData.schedule || {
          days: [],
          time: '',
          duration: 60
        },
        level: classData.level || 'beginner',
        category: classData.category || 'General',
        max_students: classData.maxStudents || 10,
        is_public: true, // Default to public
        chapters: classData.chapters || [],
        tags: classData.tags || [],
        enrolled_students: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to insert class data:', dbClassData);
      
      // Enable RLS bypass for anonymous access
      const { data: insertedData, error } = await supabase
        .from('classes')
        .insert([dbClassData])
        .select('*')
        .single();
        
      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }

      if (!insertedData) {
        console.error('No data returned after insertion');
        throw new Error('Failed to create class - no data returned');
      }
      
      console.log('Successfully inserted class:', insertedData);
      
      // Convert response data for the application
      const responseData: BrailleClass = {
        id: insertedData.id,
        creatorId: insertedData.creator_id,
        title: insertedData.title,
        description: insertedData.description,
        imageUrl: insertedData.image_url,
        meetingLink: insertedData.meeting_link,
        schedule: insertedData.schedule,
        level: insertedData.level,
        category: insertedData.category,
        maxStudents: insertedData.max_students,
        isPublic: insertedData.is_public,
        chapters: insertedData.chapters || [],
        enrolledStudents: insertedData.enrolled_students || [],
        tags: insertedData.tags || [],
        createdAt: insertedData.created_at,
        updatedAt: insertedData.updated_at
      };
      
      return { data: responseData, error: null };
    } catch (error) {
      console.error('Error creating class:', error);
      return { data: null, error };
    }
  },

  async updateClass(
    classId: string,
    updates: Partial<BrailleClass>,
    imageFile?: File
  ): Promise<{ data: BrailleClass | null; error: any }> {
    try {
      let imageUrl = updates.imageUrl;
      
      // Upload new image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `class-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('class-images')
          .upload(filePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('class-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // Update class in database
      const { data, error } = await supabase
        .from('classes')
        .update({
          ...updates,
          imageUrl,
          updatedAt: new Date().toISOString()
        })
        .eq('id', classId)
        .select()
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating class:', error);
      return { data: null, error };
    }
  },

  async getClasses(filters?: {
    creatorId?: string;
    level?: string;
    category?: string;
    isPublic?: boolean;
  }): Promise<{ data: BrailleClass[]; error: any }> {
    try {
      console.log('Fetching classes with filters:', filters);
      
      // Start with a basic query
      let query = supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters if provided
      if (filters?.creatorId) {
        query = query.eq('creator_id', filters.creatorId); // Note: using snake_case for DB columns
      }
      
      if (filters?.level) {
        query = query.eq('level', filters.level);
      }
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic); // Note: using snake_case for DB columns
      }
      
      console.log('Executing database query...');
      const { data: queryData, error } = await query;
      
      if (error) {
        console.error('Database error when fetching classes:', error);
        throw error;
      }
      
      console.log('Retrieved classes:', queryData?.length || 0);
      
      // Convert the data from snake_case to camelCase
      const formattedData = (queryData || []).map(item => ({
        id: item.id,
        creatorId: item.creator_id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        meetingLink: item.meeting_link,
        schedule: item.schedule,
        level: item.level,
        category: item.category,
        maxStudents: item.max_students,
        isPublic: item.is_public,
        chapters: item.chapters || [],
        enrolledStudents: item.enrolled_students || [],
        tags: item.tags || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching classes:', error);
      return { data: [], error };
    }
  },

  async getClassById(classId: string): Promise<{ data: BrailleClass | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching class:', error);
      return { data: null, error };
    }
  },

  async enrollInClass(classId: string, userId: string): Promise<{ error: any }> {
    try {
      // Get current class data
      const { data: classData, error: fetchError } = await this.getClassById(classId);
      if (fetchError) throw fetchError;
      if (!classData) throw new Error('Class not found');
      
      // Check if class is full
      if (classData.enrolledStudents.length >= classData.maxStudents) {
        throw new Error('Class is full');
      }
      
      // Add user to enrolled students
      const { error } = await supabase
        .from('classes')
        .update({
          enrolledStudents: [...classData.enrolledStudents, userId],
          updatedAt: new Date().toISOString()
        })
        .eq('id', classId);
        
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error enrolling in class:', error);
      return { error };
    }
  },

  async unenrollFromClass(classId: string, userId: string): Promise<{ error: any }> {
    try {
      // Get current class data
      const { data: classData, error: fetchError } = await this.getClassById(classId);
      if (fetchError) throw fetchError;
      if (!classData) throw new Error('Class not found');
      
      // Remove user from enrolled students
      const { error } = await supabase
        .from('classes')
        .update({
          enrolledStudents: classData.enrolledStudents.filter(id => id !== userId),
          updatedAt: new Date().toISOString()
        })
        .eq('id', classId);
        
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error unenrolling from class:', error);
      return { error };
    }
  },

  async addChapter(classId: string, chapter: Omit<Chapter, 'id'>): Promise<{ data: Chapter | null; error: any }> {
    try {
      // Get current class data to determine next chapter order
      const { data: classData, error: fetchError } = await this.getClassById(classId);
      if (fetchError) throw fetchError;
      if (!classData) throw new Error('Class not found');
      
      const nextOrder = Math.max(...classData.chapters.map(c => c.order), 0) + 1;
      
      const newChapter = {
        ...chapter,
        id: `chapter-${Date.now()}-${Math.random()}`,
        order: nextOrder
      };
      
      // Update class with new chapter
      const { error } = await supabase
        .from('classes')
        .update({
          chapters: [...classData.chapters, newChapter],
          updatedAt: new Date().toISOString()
        })
        .eq('id', classId)
        .select()
        .single();
        
      if (error) throw error;
      
      return { data: newChapter, error: null };
    } catch (error) {
      console.error('Error adding chapter:', error);
      return { data: null, error };
    }
  },

  async updateChapter(
    classId: string,
    chapterId: string,
    updates: Partial<Chapter>
  ): Promise<{ data: Chapter | null; error: any }> {
    try {
      // Get current class data
      const { data: classData, error: fetchError } = await this.getClassById(classId);
      if (fetchError) throw fetchError;
      if (!classData) throw new Error('Class not found');
      
      // Update specific chapter
      const updatedChapters = classData.chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, ...updates } : chapter
      );
      
      // Update class with modified chapters
      const { data: updatedClass, error } = await supabase
        .from('classes')
        .update({
          chapters: updatedChapters,
          updatedAt: new Date().toISOString()
        })
        .eq('id', classId)
        .select()
        .single();
        
      if (error) throw error;
      
      return { 
        data: updatedClass?.chapters.find((c: Chapter) => c.id === chapterId) || null,
        error: null
      };
    } catch (error) {
      console.error('Error updating chapter:', error);
      return { data: null, error };
    }
  },

  async deleteChapter(classId: string, chapterId: string): Promise<{ error: any }> {
    try {
      // Get current class data
      const { data: classData, error: fetchError } = await this.getClassById(classId);
      if (fetchError) throw fetchError;
      if (!classData) throw new Error('Class not found');
      
      // Remove chapter and reorder remaining chapters
      const remainingChapters = classData.chapters
        .filter(chapter => chapter.id !== chapterId)
        .map((chapter, index) => ({
          ...chapter,
          order: index + 1
        }));
      
      // Update class without deleted chapter
      const { error } = await supabase
        .from('classes')
        .update({
          chapters: remainingChapters,
          updatedAt: new Date().toISOString()
        })
        .eq('id', classId);
        
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return { error };
    }
  }
};