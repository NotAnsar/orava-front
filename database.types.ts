export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			category: {
				Row: {
					createdAt: string;
					id: string;
					name: string;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					name: string;
				};
				Update: {
					createdAt?: string;
					id?: string;
					name?: string;
				};
				Relationships: [];
			};
			colors: {
				Row: {
					createdAt: string;
					id: string;
					name: string;
					value: string | null;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					name: string;
					value?: string | null;
				};
				Update: {
					createdAt?: string;
					id?: string;
					name?: string;
					value?: string | null;
				};
				Relationships: [];
			};
			order_Items: {
				Row: {
					createdAt: string;
					id: string;
					order_id: string;
					product_id: string;
					quantity: number;
					unit_price: number;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					order_id?: string;
					product_id?: string;
					quantity: number;
					unit_price: number;
				};
				Update: {
					createdAt?: string;
					id?: string;
					order_id?: string;
					product_id?: string;
					quantity?: number;
					unit_price?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'order_Items_order_id_fkey';
						columns: ['order_id'];
						isOneToOne: false;
						referencedRelation: 'orders';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'order_Items_product_id_fkey';
						columns: ['product_id'];
						isOneToOne: false;
						referencedRelation: 'product';
						referencedColumns: ['id'];
					}
				];
			};
			orders: {
				Row: {
					createdAt: string;
					id: string;
					status: Database['public']['Enums']['status'];
					total: number;
					user_id: string;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					status?: Database['public']['Enums']['status'];
					total: number;
					user_id?: string;
				};
				Update: {
					createdAt?: string;
					id?: string;
					status?: Database['public']['Enums']['status'];
					total?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'orders_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'user';
						referencedColumns: ['id'];
					}
				];
			};
			product: {
				Row: {
					archived: boolean;
					category_id: string;
					color_id: string | null;
					createdAt: string;
					description: string | null;
					featured: boolean;
					id: string;
					name: string;
					price: number;
					size_id: string;
					stock: number;
				};
				Insert: {
					archived?: boolean;
					category_id?: string;
					color_id?: string | null;
					createdAt?: string;
					description?: string | null;
					featured?: boolean;
					id?: string;
					name: string;
					price: number;
					size_id: string;
					stock: number;
				};
				Update: {
					archived?: boolean;
					category_id?: string;
					color_id?: string | null;
					createdAt?: string;
					description?: string | null;
					featured?: boolean;
					id?: string;
					name?: string;
					price?: number;
					size_id?: string;
					stock?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'product_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'category';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'product_color_id_fkey';
						columns: ['color_id'];
						isOneToOne: false;
						referencedRelation: 'colors';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'product_size_id_fkey';
						columns: ['size_id'];
						isOneToOne: false;
						referencedRelation: 'sizes';
						referencedColumns: ['id'];
					}
				];
			};
			sizes: {
				Row: {
					createdAt: string;
					fullname: string | null;
					id: string;
					name: string;
				};
				Insert: {
					createdAt?: string;
					fullname?: string | null;
					id?: string;
					name: string;
				};
				Update: {
					createdAt?: string;
					fullname?: string | null;
					id?: string;
					name?: string;
				};
				Relationships: [];
			};
			user: {
				Row: {
					createdAt: string;
					email: string;
					firstName: string | null;
					id: string;
					lastName: string | null;
					role: string | null;
				};
				Insert: {
					createdAt?: string;
					email: string;
					firstName?: string | null;
					id?: string;
					lastName?: string | null;
					role?: string | null;
				};
				Update: {
					createdAt?: string;
					email?: string;
					firstName?: string | null;
					id?: string;
					lastName?: string | null;
					role?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'user_id_fkey';
						columns: ['id'];
						isOneToOne: true;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			role: 'admin' | 'user';
			status: 'pending' | 'shipped' | 'delivered' | 'canceled';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
			PublicSchema['Views'])
	? (PublicSchema['Tables'] &
			PublicSchema['Views'])[PublicTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
	? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
	? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema['Enums']
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
	? PublicSchema['Enums'][PublicEnumNameOrOptions]
	: never;
