# -*- coding: utf-8 -*-
import datetime
import json
from datetime import date
from django.contrib.auth import update_session_auth_hash
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.validators import UniqueValidator
from schedule.models import CourseSchedule
from users.models import User, Location, StudentNote, StudentGoal, StudentPracticeLog, StudentObjective, StudentWishList, StudentMaterial, StudentPlan, StudentPlanSection, StudentPlanFile
from users.tasks import send_basic_email


class StudentGoalSerializer(serializers.ModelSerializer):
    goal = serializers.CharField(required=False)
    student = serializers.CharField(required=False)
    goal_target_date = serializers.DateTimeField(format=None, input_formats=None, required=False)
    goal_complete_date = serializers.DateTimeField(format=None, input_formats=None, required=False)

    class Meta:
        model = StudentGoal
        fields = ('id', 'student', 'goal', 'goal_target_date', 'goal_complete', 'goal_complete_date', 'goal_notes', 'goal_created',)


class SimpleStudentGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentGoal
        fields = ('id', 'goal_target_date', 'goal_complete', 'goal_complete_date', 'goal_created',)


class StudentPracticeLogSerializer(serializers.ModelSerializer):
    practice_category_display = serializers.SerializerMethodField(source='practice_category', required=False)
    practice_date = serializers.DateTimeField(format=None, input_formats=None, required=False)


    class Meta:
        model = StudentPracticeLog
        fields = ('id', 'student', 'practice_category', 'practice_category_display', 'practice_item', 'practice_time', 'practice_speed', 'practice_notes', 'practice_date', 'practice_item_created',)

    def get_practice_category_display(self, obj):
        return obj.get_practice_category_display();


class SimplePracticeLogSerializer(serializers.ModelSerializer):
    practice_category_display = serializers.SerializerMethodField(source='practice_category', required=False)
    practice_date = serializers.DateTimeField(format=None, input_formats=None, required=False)

    class Meta:
        model = StudentPracticeLog
        fields = ('id', 'practice_category', 'practice_category_display', 'practice_item', 'practice_time', 'practice_speed', 'practice_date', 'practice_item_created',)

    def get_practice_category_display(self, obj):
        return obj.get_practice_category_display();


class StudentObjectiveSerializer(serializers.ModelSerializer):
    objective = serializers.CharField(required=False)
    student = serializers.CharField(required=False)
    objective_complete_date = serializers.DateTimeField(format=None, input_formats=None, required=False)

    class Meta:
        model = StudentObjective
        fields = ('id', 'student', 'objective', 'objective_complete', 'objective_complete_date', 'objective_notes', 'objective_visible', 'objective_priority', 'objective_created',)


class SimpleStudentObjectiveSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentObjective
        fields = ('id', 'objective_complete', 'objective_complete_date', 'objective_visible', 'objective_priority', 'objective_created',)


class StudentWishListSerializer(serializers.ModelSerializer):
    wish_item = serializers.CharField(required=False)
    student = serializers.CharField(required=False)
    wish_item_complete_date = serializers.DateTimeField(format=None, input_formats=None, required=False)

    class Meta:
        model = StudentWishList
        fields = ('id', 'student', 'wish_item', 'wish_item_complete', 'wish_item_complete_date', 'wish_item_notes', 'wish_item_created',)


class SimpleStudentWishListSerilizer(serializers.ModelSerializer):

    class Meta:
        model = StudentWishList
        fields = ('id', 'wish_item_complete', 'wish_item_complete_date', 'wish_item_created',)


class SimpleUserSerializer(serializers.ModelSerializer):
    recent_goal = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'is_active', 'user_pic', 'first_name', 'last_name', 'email', 'recent_goal', 'play_level')

    def get_recent_goal(self, obj):
        student_goal = StudentGoal.objects.filter(student=obj).filter(goal_complete=False).order_by('goal_target_date')
        
        if student_goal:    
            goal = student_goal[0].goal
            goal_date = student_goal[0].goal_target_date
        else:
            goal = ''
            goal_date = ''

        return {'goal':goal, 'goal_target_date':goal_date}


class StudentMaterialSerializer(serializers.ModelSerializer):
    student = serializers.CharField(required=False, read_only=True)
    student_group = SimpleUserSerializer(many=True, required=False, read_only=True)
    file = serializers.CharField(required=False, allow_blank=True)
    material_added = serializers.DateTimeField(format=None, input_formats=None, required=False)
    material_added_by = SimpleUserSerializer(required=False)
    material_updated = serializers.DateTimeField(format=None, input_formats=None, required=False)
    material_updated_by = SimpleUserSerializer(required=False)

    class Meta:
        model = StudentMaterial
        fields = ('id', 'student', 'student_group', 'file', 'material_name', 'material_notes', 'material_added', 'material_added_by', 'material_updated', 'material_updated_by',)

    def create(self, validated_data):
        group = None
        if 'group' in validated_data:
            group = validated_data.pop('group')
        student_material = StudentMaterial.objects.create(**validated_data)
        if group:
            for g in group:
                student = User.objects.get(id=g)
                student_material.student_group.add(student)
                if student.is_active:
                    try:
                        send_basic_email.delay(student.id, 'UPD')
                    except:
                        pass
        try:
            send_basic_email.delay(student_material.student.id, 'UPD')
        except:
            pass

        student_material.save()
        return student_material

    def update(self, instance, validated_data):
        instance.student = validated_data.get('student', instance.student)
        instance.file = validated_data.get('file', instance.file)
        instance.material_name = validated_data.get('material_name', instance.material_name)
        instance.material_notes = validated_data.get('material_notes', instance.material_notes)
        instance.material_updated_by = validated_data.get('material_updated_by', instance.material_updated_by)

        if 'group' in validated_data:
            upd_group = [int(x) for x in validated_data.pop('group')]
            group_student = instance.student_group.all().values_list('id', flat=True)
            out_group = set(upd_group) ^ set(group_student)
            in_group = set(upd_group) & set(group_student)
            if set(upd_group) != set(group_student):
                for student_id in out_group:
                    if student_id in upd_group:
                        student = User.objects.get(id=student_id)
                        instance.student_group.add(student)
                        if student.is_active:
                            try:
                                send_basic_email.delay(student.id, 'UPD')
                            except:
                                pass
                    else:
                        student = User.objects.get(id=student_id)
                        instance.student_group.remove(student)

        instance.save()
        return instance


class StudentPlanFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentPlanFile
        fields = ('id', 'plan_section', 'plan_file', 'plan_file_name', 'plan_file_created', 'plan_file_created_by', 'plan_file_updated', 'plan_file_updated_by',)


class StudentPlanSectionSerializer(serializers.ModelSerializer):
    plan_section_file = StudentPlanFileSerializer(many=True, required=False, allow_null=True, read_only=True)
    section_created_by = serializers.CharField(required=False)
    section_updated_by = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = StudentPlanSection
        fields = ('id', 'student_plan', 'section_week', 'section_number', 'section_title', 'section_description', 'section_notes', 'section_created', 'section_created_by', 'section_updated', 'section_updated_by', 'plan_section_file',)

    def create(self, validated_data):
        plan_files = validated_data.pop('files')
        plan_id = validated_data.pop('student_plan')

        if 'plan_section_file' in validated_data:
            plan_section_file = validated_data.pop('plan_section_file')
        try:
            student_plan = StudentPlan.objects.get(id=plan_id)
            plan_section = StudentPlanSection.objects.create(student_plan=student_plan, **validated_data)
        except Exception, e:
            pass

        for file in plan_files:
            try:
                plan_file = StudentPlanFile.objects.create(plan_section=plan_section, plan_file=file, plan_file_created_by=plan_section.section_created_by)
                plan_file.save()
            except:
                pass

        plan_section.save()
        return plan_section

    def update(self, instance, validated_data):
        instance.section_week = validated_data.get('section_week', instance.section_week)
        instance.section_number = validated_data.get('section_number', instance.section_number)
        instance.section_title = validated_data.get('section_title', instance.section_title)
        instance.section_description = validated_data.get('section_description', instance.section_description)
        instance.section_notes = validated_data.get('section_notes', instance.section_notes)
        instance.section_updated_by = validated_data.get('section_updated_bysection_updated_by', instance.section_updated_by)

        if 'files' in validated_data:
            files = validated_data.pop('files')
            for file in files:
                file_obj, created = StudentPlanFile.objects.update_or_create(plan_section=instance, plan_file=file)
                if created:
                    file_obj.plan_file_created_by = instance.section_updated_by
                else:
                    file_obj.plan_file_updated_by = instance.section_updated_by
                file_obj.save()

        instance.save()
        return instance

class StudentPlanSerializer(serializers.ModelSerializer):
    plan_student = SimpleUserSerializer(many=True, required=False, read_only=True)
    plan_section = StudentPlanSectionSerializer(many=True, required=False, allow_null=True, read_only=True)
    plan_created_by = serializers.CharField(required=False)
    plan_updated_by = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = StudentPlan
        fields = ('id', 'plan_title', 'plan_description', 'plan_section', 'plan_created', 'plan_created_by', 'plan_updated', 'plan_updated_by', 'plan_student',)

    def create(self, validated_data):
        students = validated_data.pop('plan_student')
        user = validated_data.pop('user')
        try:
            student_plan = StudentPlan.objects.create(plan_created_by=user, **validated_data)
        except:
            pass
        if student_plan and students:
            for student_id in students:
                try:
                    student = User.objects.get(id=student_id)
                    student.student_plan = student_plan
                    student.save()
                except:
                    pass

        student_plan.save()
        return student_plan

    def update(self, instance, validated_data):

        user = validated_data.pop('user')

        instance.plan_title = validated_data.get('plan_title', instance.plan_title)
        instance.plan_description = validated_data.get('plan_description', instance.plan_description)

        if 'plan_student' in validated_data:
            upd_group = [int(x) for x in validated_data.pop('plan_student')]
            group_student = User.objects.filter(student_plan=instance).values_list('id', flat=True)
            out_group = set(upd_group) ^ set(group_student)
            in_group = set(upd_group) & set(group_student)
            if set(upd_group) != set(group_student):
                for student_id in out_group:
                    if student_id in upd_group:
                        student = User.objects.get(id=student_id)
                        student.student_plan = instance
                    else:
                        student = User.objects.get(id=student_id)
                        student.student_plan = None
                    student.save()

            instance.plan_updated_by = user

            instance.save()
            return instance


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name', 'addr1', 'addr2', 'city', 'state', 'zip_code', 'phone_main', 'phone_other', 'notes',)


class StudentNoteSerializer(serializers.ModelSerializer):
    student = serializers.CharField(required=False)
    note = serializers.CharField(required=False)
    note_created_by = serializers.CharField(required=False)

    class Meta:
        model = StudentNote
        fields = ('id', 'student', 'note', 'note_created', 'note_created_by', 'note_updated',)


class UserLeaderBoardSerializer(serializers.ModelSerializer):
    play_level_display = serializers.CharField(source='get_play_level_display', required=False)
    student_goal = SimpleStudentGoalSerializer(many=True, required=False)
    student_log = SimplePracticeLogSerializer(many=True, required=False)
    student_objective = SimpleStudentObjectiveSerializer(many=True, required=False)
    student_wishlist = SimpleStudentWishListSerilizer(many=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'is_active', 'user_pic', 'first_name', 'last_name', 'email', 'play_level', 'play_level_display', 'student_goal', 'student_log', 'student_objective', 'student_wishlist',)


class UserSerializer(serializers.ModelSerializer):
    play_level_display = serializers.CharField(source='get_play_level_display', required=False)
    email = serializers.CharField(required=False, allow_blank=True, validators=[
    UniqueValidator(
        queryset=User.objects.all(),
        message="My custom error",)])
    is_active = serializers.BooleanField(required=False)
    user_pic = serializers.CharField(required=False, allow_blank=True)
    student_goal = StudentGoalSerializer(many=True, required=False)
    student_log = StudentPracticeLogSerializer(many=True, required=False)
    student_objective = StudentObjectiveSerializer(many=True, required=False)
    student_wishlist = StudentWishListSerializer(many=True, required=False)
    student_plan = StudentPlanSerializer(required=False)
    student_material = serializers.SerializerMethodField(required=False)
    next_course = serializers.SerializerMethodField(required=False)
    location = LocationSerializer(required=False)
    student_note = StudentNoteSerializer(many=True, required=False)
    
    class Meta:
        model = User
        fields = ('id', 'user_created', 'user_updated', 'is_active', 'is_admin', 'is_staff', 'username', 'first_name', 'last_name', 'user_pic', 'date_of_birth', 'user_credit', 'recurring_credit', 'next_course',
                'location', 'play_level', 'play_level_display', 'email', 'student_goal', 'student_log', 'student_objective', 'student_wishlist', 'student_material', 'student_plan', 'student_note',
                'course_reminder', 'practice_reminder', 'user_update',)
        read_only_fields = ('id', 'user_created', 'is_admin',)

    def create(self, validated_data):
        cur_user = validated_data.pop('user')
        try:  
            user = User.objects.create_user(**validated_data)
            user.save()

            if cur_user.id:
                user.user_created_by = cur_user
            else:
                user.user_created_by = user

            user.save()
            send_basic_email.delay(user.id, 'CRE')

            return user
        except Exception, e:
            return Response({
                'status': 'Bad request',
                'message': 'Account could not be created with received data.'
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.play_level = validated_data.get('play_level', instance.play_level)
        instance.user_pic = validated_data.get('user_pic', instance.user_pic)
        instance.user_credit = validated_data.get('user_credit', instance.user_credit)
        instance.recurring_credit = validated_data.get('recurring_credit', instance.recurring_credit)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)        
        instance.user_updated_by = validated_data.pop('user')

        if validated_data.get('is_active') == 'true':
            if instance.is_active == False:
                send_basic_email.delay(instance.id, 'ACT')
            instance.is_active = True
        else:
            instance.is_active = False

        if instance.location and instance.location.id == validated_data.get('location[id]'):
                instance.location = validated_data.get('location', instance.location)
        elif 'location[id]' in validated_data:
            location_id = validated_data.get('location[id]')
            location = Location.objects.get(id=location_id)
            instance.location = location

        instance.save()
        password = validated_data.get('password', None)
        confirm_password = validated_data.get('confirm_password', None)

        if password and confirm_password and password == confirm_password:
            instance.set_password(password)
            instance.save()

            update_session_auth_hash(self.context.get('request'), instance)

        return instance

    def get_student_material(self, obj):
        try:
            queryset = StudentMaterial.objects.filter(Q(student=obj) | Q(student_group=obj)).distinct()
            serializer = StudentMaterialSerializer(queryset, many=True)
            return serializer.data
        except:
            pass

    def get_next_course(self,obj):
        try:
            if obj.is_admin:
                course = CourseSchedule.objects.all().exclude(schedule_date__lt=timezone.now()).earliest('schedule_date')
            else:
                course = CourseSchedule.objects.filter(student=obj).exclude(schedule_date__lt=timezone.now()).earliest('schedule_date')

            return {'course_date': datetime.datetime.combine(course.schedule_date, course.schedule_start_time), 'course_name':course.course.course_title}
        except CourseSchedule.DoesNotExist:
            course = None
           
            return {'course_date': '', 'course_name': ''}
