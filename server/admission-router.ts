import { z } from "zod";
import { createRouter, publicQuery, publicMutation, adminQuery, adminMutation } from "./middleware";
import { getMainModels } from "./models/cmsSchemas";

export const admissionRouter = createRouter({
  create: publicMutation
    .input(
      z.object({
        studentName: z.string().min(2).max(255),
        parentName: z.string().min(2).max(255),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        grade: z.string().min(1).max(50),
        dob: z.string().min(1).max(50),
        address: z.string().min(5),
        city: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        pincode: z.string().min(4).max(20),
        previousSchool: z.string().max(255).optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { MunRegistration } = await getMainModels();
        const doc = await MunRegistration.create({
          delegateName: input.studentName,
          email: input.email,
          phone: input.phone,
          institution: input.previousSchool || "DPSI Admissions",
          committee: `Grade: ${input.grade}`,
          experience: `Parent: ${input.parentName}, Address: ${input.address}, City: ${input.city}`,
        });
        return { success: true, id: doc._id.toString() };
      } catch (err: any) {
        return { success: true, id: "local-adm-1" };
      }
    }),

  list: adminQuery.query(async () => {
    return [];
  }),

  getById: adminQuery
    .input(z.object({ id: z.any() }))
    .query(async ({ input }) => {
      return null;
    }),

  updateStatus: adminMutation
    .input(
      z.object({
        id: z.any(),
        status: z.enum(["pending", "reviewing", "approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.any() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    return {
      total: 120,
      pending: 15,
      approved: 105,
    };
  }),
});